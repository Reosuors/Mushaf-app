package com.ahmad.mushaf;

import android.app.Activity;
import android.content.Context;
import android.content.pm.InstallSourceInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Donations through Google Play Billing (one-time consumable "support_*" products),
 * plus the installer check that decides which donation UI the app shows.
 * Play installs: Play Billing only. Any other install: the app's own support page.
 */
@CapacitorPlugin(name = "PlayBilling")
public class PlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private static final String TAG = "MushafBilling";
    private BillingClient client;
    private final Map<String, ProductDetails> details = new HashMap<>();
    private PluginCall pendingPurchase;
    private final List<Runnable> waiting = new ArrayList<>();
    private final List<PluginCall> waitingCalls = new ArrayList<>();
    private boolean connecting = false;

    /** Which store installed this copy of the app (null when sideloaded / unknown). */
    @PluginMethod
    public void getInstallSource(PluginCall call) {
        String installer = null;
        try {
            Context ctx = getContext();
            PackageManager pm = ctx.getPackageManager();
            if (Build.VERSION.SDK_INT >= 30) {
                InstallSourceInfo info = pm.getInstallSourceInfo(ctx.getPackageName());
                installer = info.getInstallingPackageName();
            } else {
                installer = pm.getInstallerPackageName(ctx.getPackageName());
            }
        } catch (Exception e) {
            Log.w(TAG, "installer check failed", e);
        }
        JSObject out = new JSObject();
        out.put("installer", installer);
        out.put("fromPlay", "com.android.vending".equals(installer));
        call.resolve(out);
    }

    private synchronized void withClient(Runnable ready, PluginCall failTo) {
        if (client != null && client.isReady()) { ready.run(); return; }
        if (client == null) {
            client = BillingClient.newBuilder(getContext())
                .setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .enableAutoServiceReconnection()
                .build();
        }
        waiting.add(ready);
        waitingCalls.add(failTo);
        if (connecting) return;
        connecting = true;
        client.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                List<Runnable> run;
                List<PluginCall> calls;
                synchronized (PlayBillingPlugin.this) {
                    connecting = false;
                    run = new ArrayList<>(waiting);
                    calls = new ArrayList<>(waitingCalls);
                    waiting.clear();
                    waitingCalls.clear();
                }
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    for (Runnable r : run) r.run();
                    finishOldPurchases();
                } else {
                    for (PluginCall c : calls) {
                        if (c != null) c.reject("billing_unavailable:" + result.getResponseCode() + " " + result.getDebugMessage());
                    }
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                synchronized (PlayBillingPlugin.this) { connecting = false; }
            }
        });
    }

    /** Price list for the given product ids, in the donor's own currency (Play formats it). */
    @PluginMethod
    public void getProducts(PluginCall call) {
        JSArray ids = call.getArray("productIds");
        List<QueryProductDetailsParams.Product> list = new ArrayList<>();
        try {
            for (int i = 0; i < ids.length(); i++) {
                list.add(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(ids.getString(i))
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build());
            }
        } catch (Exception e) {
            call.reject("bad_product_ids");
            return;
        }
        if (list.isEmpty()) { call.reject("bad_product_ids"); return; }
        withClient(() -> client.queryProductDetailsAsync(
            QueryProductDetailsParams.newBuilder().setProductList(list).build(),
            (result, res) -> {
                JSObject out = new JSObject();
                JSArray products = new JSArray();
                out.put("responseCode", result.getResponseCode());
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && res != null) {
                    for (ProductDetails d : res.getProductDetailsList()) {
                        ProductDetails.OneTimePurchaseOfferDetails o = d.getOneTimePurchaseOfferDetails();
                        if (o == null) continue;
                        details.put(d.getProductId(), d);
                        JSObject p = new JSObject();
                        p.put("productId", d.getProductId());
                        p.put("title", d.getName());
                        p.put("price", o.getFormattedPrice());
                        p.put("priceMicros", o.getPriceAmountMicros());
                        p.put("currency", o.getPriceCurrencyCode());
                        products.put(p);
                    }
                }
                out.put("products", products);
                call.resolve(out);
            }), call);
    }

    /** Opens Google Play's own payment sheet. Resolves with status success | pending | cancelled | error. */
    @PluginMethod
    public void purchase(PluginCall call) {
        String id = call.getString("productId");
        ProductDetails d = id == null ? null : details.get(id);
        Activity activity = getActivity();
        if (d == null || activity == null) { call.reject("product_not_loaded"); return; }
        withClient(() -> {
            List<BillingFlowParams.ProductDetailsParams> pd = new ArrayList<>();
            pd.add(BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(d).build());
            synchronized (PlayBillingPlugin.this) {
                if (pendingPurchase != null) pendingPurchase.resolve(status("cancelled", null));
                pendingPurchase = call;
            }
            activity.runOnUiThread(() -> {
                BillingResult r = client.launchBillingFlow(activity,
                    BillingFlowParams.newBuilder().setProductDetailsParamsList(pd).build());
                if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    finishCall(status(r.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED ? "cancelled" : "error", null)
                        .put("responseCode", r.getResponseCode()));
                }
            });
        }, call);
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        int code = result.getResponseCode();
        if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase p : purchases) handle(p, true);
        } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            finishCall(status("cancelled", null));
        } else {
            finishCall(status("error", null).put("responseCode", code));
        }
    }

    private void handle(Purchase p, boolean fromFlow) {
        String product = p.getProducts().isEmpty() ? null : p.getProducts().get(0);
        if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
            // Consuming acknowledges the purchase (Google requires that within 3 days)
            // and lets the same person donate the same amount again.
            client.consumeAsync(ConsumeParams.newBuilder().setPurchaseToken(p.getPurchaseToken()).build(),
                (r, token) -> {
                    boolean ok = r.getResponseCode() == BillingClient.BillingResponseCode.OK;
                    JSObject s = status(ok ? "success" : "error", product).put("responseCode", r.getResponseCode());
                    if (fromFlow) finishCall(s);
                    else if (ok) notifyListeners("donationCompleted", s, true);
                });
        } else if (p.getPurchaseState() == Purchase.PurchaseState.PENDING) {
            if (fromFlow) finishCall(status("pending", product));
        }
    }

    /** Pending payments that completed later, or a purchase the app was closed before finishing. */
    private void finishOldPurchases() {
        if (client == null || !client.isReady()) return;
        client.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
            (r, list) -> {
                if (r.getResponseCode() != BillingClient.BillingResponseCode.OK || list == null) return;
                for (Purchase p : list) {
                    if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) handle(p, false);
                }
            });
    }

    /** Called by the app when the support screen opens, so finished pending payments are consumed. */
    @PluginMethod
    public void finishPending(PluginCall call) {
        withClient(() -> { finishOldPurchases(); call.resolve(); }, call);
    }

    private JSObject status(String s, String product) {
        JSObject o = new JSObject();
        o.put("status", s);
        if (product != null) o.put("productId", product);
        return o;
    }

    private void finishCall(JSObject value) {
        PluginCall c;
        synchronized (this) { c = pendingPurchase; pendingPurchase = null; }
        if (c != null) c.resolve(value);
        else if ("success".equals(value.getString("status"))) notifyListeners("donationCompleted", value, true);
    }

    @Override
    protected void handleOnDestroy() {
        if (client != null) client.endConnection();
        super.handleOnDestroy();
    }
}

package app.churros;

import com.getcapacitor.BridgeActivity;
import android.webkit.CookieManager;

public class MainActivity extends BridgeActivity {
    @Override
    public void onPause() {
        super.onPause();

        CookieManager.getInstance().flush();
    }
}

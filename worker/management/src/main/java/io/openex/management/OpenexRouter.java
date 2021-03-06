package io.openex.management;

import org.apache.camel.Exchange;
import org.apache.camel.Header;
import org.apache.camel.Headers;
import org.apache.camel.Properties;

import java.util.Map;

@SuppressWarnings("PackageAccessibility")
public class OpenexRouter {
	
	@SuppressWarnings("unused")
	public String forward(String body,
						  @Headers Map<String, Object> headers,
						  @Properties Map<String, Object> properties,
						  @Header(Exchange.SLIP_ENDPOINT) String previous) {
		
		if (previous == null) {
			Object routing = headers.get("router-header");
			return routing != null ? ("direct:" + routing) : null;
		}
		
		// no more so return null
		return null;
	}
}

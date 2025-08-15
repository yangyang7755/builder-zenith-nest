// Network Service - Monitors connection status and provides fallbacks
export interface NetworkStatus {
  isOnline: boolean;
  isServerReachable: boolean;
  lastChecked: Date;
  connectionQuality: "good" | "poor" | "offline";
}

class NetworkService {
  private static instance: NetworkService;
  private status: NetworkStatus = {
    isOnline: navigator.onLine,
    isServerReachable: false,
    lastChecked: new Date(),
    connectionQuality: "offline",
  };
  private listeners: Array<(status: NetworkStatus) => void> = [];
  private checkInterval: number | null = null;

  private constructor() {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));

    // Start periodic server checks
    this.startPeriodicChecks();

    // Initial server check
    this.checkServerConnection();
  }

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  public getStatus(): NetworkStatus {
    return { ...this.status };
  }

  public addListener(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private handleOnline(): void {
    this.updateStatus({ isOnline: true });
    this.checkServerConnection();
  }

  private handleOffline(): void {
    this.updateStatus({
      isOnline: false,
      isServerReachable: false,
      connectionQuality: "offline",
    });
  }

  private updateStatus(updates: Partial<NetworkStatus>): void {
    this.status = {
      ...this.status,
      ...updates,
      lastChecked: new Date(),
    };

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(this.getStatus());
      } catch (error) {
        console.error("Error in network status listener:", error);
      }
    });
  }

  private async checkServerConnection(): Promise<void> {
    if (!this.status.isOnline) {
      return;
    }

    try {
      const startTime = Date.now();
      const response = await fetch("/api/health", {
        method: "GET",
        cache: "no-cache",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const responseTime = Date.now() - startTime;
      const isReachable = response.ok;

      let quality: "good" | "poor" | "offline" = "offline";
      if (isReachable) {
        quality = responseTime < 1000 ? "good" : "poor";
      }

      this.updateStatus({
        isServerReachable: isReachable,
        connectionQuality: quality,
      });
    } catch (error) {
      console.warn("Server health check failed:", error);
      this.updateStatus({
        isServerReachable: false,
        connectionQuality: this.status.isOnline ? "poor" : "offline",
      });
    }
  }

  private startPeriodicChecks(): void {
    // Check server connection every 30 seconds
    this.checkInterval = window.setInterval(() => {
      this.checkServerConnection();
    }, 30000);
  }

  public async isApiEndpointReachable(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(endpoint, {
        method: "HEAD",
        cache: "no-cache",
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  public shouldUseOfflineMode(): boolean {
    return !this.status.isOnline || !this.status.isServerReachable;
  }

  public getRetryDelay(): number {
    switch (this.status.connectionQuality) {
      case "good":
        return 1000;
      case "poor":
        return 5000;
      case "offline":
        return 15000;
      default:
        return 5000;
    }
  }

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    window.removeEventListener("online", this.handleOnline.bind(this));
    window.removeEventListener("offline", this.handleOffline.bind(this));

    this.listeners = [];
  }
}

// Enhanced fetch wrapper with network awareness
export const networkAwareFetch = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 8000,
): Promise<Response> => {
  const networkService = NetworkService.getInstance();
  const status = networkService.getStatus();

  // If completely offline, throw immediately
  if (!status.isOnline) {
    throw new Error("No internet connection");
  }

  // If server is known to be unreachable, throw server error
  if (!status.isServerReachable && url.startsWith("/api/")) {
    throw new Error("Server unreachable");
  }

  // Adjust timeout based on connection quality
  const adjustedTimeout =
    status.connectionQuality === "poor" ? timeout * 2 : timeout;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), adjustedTimeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Update server reachability based on response
    if (url.startsWith("/api/")) {
      networkService.updateStatus({ isServerReachable: response.ok });
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Update server status on API failures
    if (url.startsWith("/api/")) {
      networkService.updateStatus({ isServerReachable: false });
    }

    throw error;
  }
};

export const networkService = NetworkService.getInstance();
export default networkService;

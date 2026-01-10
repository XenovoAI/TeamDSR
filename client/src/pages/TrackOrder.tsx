import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Search, Truck, CheckCircle, Clock, MapPin, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrackingInfo {
  awb: string;
  status: string;
  current_location: string;
  delivered_date?: string;
  activities: {
    date: string;
    activity: string;
    location: string;
  }[];
}

export default function TrackOrder() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Enter Tracking Number",
        description: "Please enter your AWB/tracking number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingInfo(null);

    try {
      const response = await fetch(`/api/shiprocket/track/${trackingNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tracking info');
      }

      if (data.tracking_data) {
        setTrackingInfo({
          awb: trackingNumber,
          status: data.tracking_data.shipment_status_id === 7 ? 'Delivered' : 
                  data.tracking_data.shipment_status_id === 6 ? 'Out for Delivery' :
                  data.tracking_data.shipment_status_id >= 4 ? 'In Transit' : 'Processing',
          current_location: data.tracking_data.current_status || 'N/A',
          delivered_date: data.tracking_data.delivered_date,
          activities: data.tracking_data.shipment_track_activities?.map((a: any) => ({
            date: a.date,
            activity: a.activity,
            location: a.location || ''
          })) || []
        });
      } else {
        setError('No tracking information found for this AWB number');
      }
    } catch (err: any) {
      console.error('Tracking error:', err);
      setError(err.message || 'Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'Out for Delivery':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'In Transit':
        return <Package className="h-6 w-6 text-blue-500" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/10 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="h-16 w-16 rounded-2xl bg-[#0B9B9B] flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">
              Enter your AWB/tracking number to check delivery status
            </p>
          </div>

          {/* Search Box */}
          <Card className="border-none shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter AWB / Tracking Number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                  className="h-12 text-base"
                />
                <Button 
                  onClick={handleTrack}
                  disabled={loading}
                  className="h-12 px-6 bg-[#0B9B9B] hover:bg-[#1B5E5E]"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                You can find your tracking number in your Dashboard or in the shipping confirmation email.
              </p>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Card className="border-none shadow-lg mb-8 bg-red-50 border border-red-200">
              <CardContent className="p-6 text-center">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Tracking Result */}
          {trackingInfo && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="border-none shadow-lg overflow-hidden">
                <div className={`p-6 ${getStatusColor(trackingInfo.status)} border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(trackingInfo.status)}
                      <div>
                        <div className="font-bold text-lg">{trackingInfo.status}</div>
                        <div className="text-sm opacity-80">{trackingInfo.current_location}</div>
                      </div>
                    </div>
                    <a 
                      href={`https://shiprocket.co/tracking/${trackingInfo.awb}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-1 hover:underline"
                    >
                      View on Shiprocket <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="font-medium">AWB:</span>
                    <span className="font-mono">{trackingInfo.awb}</span>
                  </div>
                  
                  {trackingInfo.delivered_date && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Delivered on {trackingInfo.delivered_date}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              {trackingInfo.activities.length > 0 && (
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Shipment Timeline</h3>
                    <div className="space-y-4">
                      {trackingInfo.activities.map((activity, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-[#0B9B9B]' : 'bg-gray-300'}`} />
                            {index < trackingInfo.activities.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="text-sm font-medium">{activity.activity}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <span>{activity.date}</span>
                              {activity.location && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {activity.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-10 text-center">
            <p className="text-muted-foreground text-sm">
              Having trouble tracking your order?{" "}
              <a href="mailto:support@neetpeak.com" className="text-[#0B9B9B] hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

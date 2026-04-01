"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
} from "@/components/ui";
import { Bot, Leaf, MapPin, Sprout, Waves } from "lucide-react";

interface RecommendationItem {
  crop: string;
  reason: string;
  guidance: string;
  considerations: string;
}

interface RecommendationResponse {
  summary: string;
  recommendations: RecommendationItem[];
  cached: boolean;
}

interface CropRecommendationPanelProps {
  isOnline: boolean;
}

const seasons = [
  "Rainy season",
  "Dry season",
  "Early planting",
  "Harvest window",
];

export function CropRecommendationPanel({
  isOnline,
}: CropRecommendationPanelProps) {
  const [form, setForm] = useState({
    location: "Kaduna",
    season: "Rainy season",
    preferredCrop: "",
    soilType: "Loamy",
    farmSize: "4 hectares",
  });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleRecommend = async () => {
    if (!form.location.trim() || !form.season.trim()) {
      setError(
        "Location and season are required before requesting a recommendation.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/ai-assistant/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to generate a recommendation right now.",
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate a recommendation right now.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="default" className="overflow-hidden">
      <CardHeader
        title="AI Crop Recommendation"
        subtitle="Request practical crop ideas based on region, season, soil, and your own preferences."
        action={
          <Badge variant={isOnline ? "success" : "warning"} size="sm" isPill>
            {isOnline ? "Live AI ready" : "Offline cache only"}
          </Badge>
        }
      />
      <CardBody className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Input
            label="Location"
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            leftIcon={<MapPin className="h-4 w-4" />}
            placeholder="e.g. Kaduna"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Season
            </label>
            <select
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-harvest-green-500 focus:ring-2 focus:ring-harvest-green-200"
              value={form.season}
              onChange={(event) => updateField("season", event.target.value)}
            >
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Preferred Crop"
            value={form.preferredCrop}
            onChange={(event) =>
              updateField("preferredCrop", event.target.value)
            }
            leftIcon={<Sprout className="h-4 w-4" />}
            placeholder="Optional"
          />
          <Input
            label="Soil Type"
            value={form.soilType}
            onChange={(event) => updateField("soilType", event.target.value)}
            leftIcon={<Leaf className="h-4 w-4" />}
            placeholder="Optional"
          />
          <Input
            label="Farm Size"
            value={form.farmSize}
            onChange={(event) => updateField("farmSize", event.target.value)}
            leftIcon={<Waves className="h-4 w-4" />}
            placeholder="Optional"
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500">
            Recommendations reuse the same AI infrastructure as the assistant
            and cache the latest result for offline viewing.
          </p>
          <Button
            variant="primary"
            onClick={handleRecommend}
            isLoading={isLoading}
            leftIcon={<Bot className="h-4 w-4" />}
          >
            Get crop ideas
          </Button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-harvest-green-50 p-4 text-sm text-harvest-green-900">
              {result.summary}
              {result.cached && (
                <span className="ml-2 font-semibold">(served from cache)</span>
              )}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {result.recommendations.map((item) => (
                <div
                  key={item.crop}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.crop}
                    </h3>
                    <Badge variant="primary" size="sm">
                      Recommended
                    </Badge>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">{item.reason}</p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold text-gray-900">
                        Planting guidance:
                      </span>{" "}
                      {item.guidance}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Seasonal watchout:
                      </span>{" "}
                      {item.considerations}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

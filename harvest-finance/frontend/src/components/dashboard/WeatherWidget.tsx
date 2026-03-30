'use client';

import React from 'react';
import {
  AlertTriangle,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  MapPin,
  RefreshCcw,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWeather } from '@/hooks/useWeather';
import type { WeatherAlertSeverity } from '@/types/weather';

const iconMap = {
  sun: Sun,
  cloud: Cloud,
  'cloud-sun': CloudSun,
  'cloud-rain': CloudRain,
  'cloud-lightning': CloudLightning,
  'cloud-snow': CloudSnow,
};

const alertTone: Record<
  WeatherAlertSeverity,
  { bg: string; border: string; text: string }
> = {
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    text: 'text-sky-800',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-900',
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    text: 'text-red-900',
  },
};

export function WeatherWidget() {
  const { data, isLoading, error, refresh } = useWeather();

  if (isLoading) {
    return (
      <Card variant="default" className="overflow-hidden">
        <CardBody className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 rounded bg-gray-200" />
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl bg-gray-100 p-5">
                <div className="h-12 w-24 rounded bg-gray-200" />
                <div className="mt-4 h-4 w-36 rounded bg-gray-200" />
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-xl bg-gray-200" />
                  <div className="h-20 rounded-xl bg-gray-200" />
                  <div className="h-20 rounded-xl bg-gray-200" />
                </div>
              </div>
              <div className="rounded-2xl bg-gray-100 p-5">
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="mt-3 space-y-3">
                  <div className="h-16 rounded-xl bg-gray-200" />
                  <div className="h-16 rounded-xl bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card variant="default">
        <CardBody className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Farm weather</h3>
              <p className="mt-1 text-sm text-gray-500">
                {error || 'Weather data could not be loaded.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCcw className="h-4 w-4" />}
              onClick={() => void refresh()}
            >
              Retry
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const WeatherIcon =
    iconMap[data.current.icon as keyof typeof iconMap] || CloudSun;

  return (
    <Card variant="default" className="overflow-hidden border-harvest-green-100">
      <CardHeader
        className="border-b border-gray-100 px-6 py-5"
        title="Farm weather"
        subtitle="Current conditions, forecast, and field alerts for planning harvest and vault activity."
        action={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCcw className="h-4 w-4" />}
            onClick={() => void refresh()}
          >
            Refresh
          </Button>
        }
      />

      <CardBody className="p-6">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-5">
            <div className="rounded-3xl bg-gradient-to-br from-harvest-green-600 to-emerald-700 p-5 text-white shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-harvest-green-50/90">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {data.location.name}
                      {data.location.region ? `, ${data.location.region}` : ''}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-harvest-green-100">
                    {data.location.country}
                  </p>
                  <div className="mt-5 flex items-end gap-3">
                    <span className="text-5xl font-bold leading-none">
                      {data.current.temperatureC}°C
                    </span>
                    <span className="pb-1 text-base text-harvest-green-100">
                      {data.current.condition}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
                  <WeatherIcon className="h-12 w-12 text-white" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MetricTile
                  icon={<Droplets className="h-4 w-4" />}
                  label="Humidity"
                  value={`${data.current.humidity}%`}
                />
                <MetricTile
                  icon={<CloudRain className="h-4 w-4" />}
                  label="Rainfall"
                  value={`${data.current.rainfallMm} mm`}
                />
                <MetricTile
                  icon={<Wind className="h-4 w-4" />}
                  label="Wind"
                  value={`${data.current.windSpeedKph} km/h`}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Thermometer className="h-4 w-4 text-harvest-green-600" />
                  Seasonal outlook
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {data.seasonalOutlook}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Planning recommendation
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {data.recommendation}
                </p>
                <p className="mt-3 text-xs uppercase tracking-wide text-gray-400">
                  Source: {data.source}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">7-day forecast</h4>
                <p className="text-xs text-gray-500">
                  Forecast icons and rainfall estimates for the coming week.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {data.forecast.map((day) => {
                  const ForecastIcon =
                    iconMap[day.icon as keyof typeof iconMap] || CloudSun;

                  return (
                    <div
                      key={day.date}
                      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {day.dayLabel}
                          </p>
                          <p className="text-xs text-gray-500">{day.condition}</p>
                        </div>
                        <ForecastIcon className="h-5 w-5 text-harvest-green-600" />
                      </div>

                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {day.maxTempC}°
                          </p>
                          <p className="text-sm text-gray-500">{day.minTempC}° low</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>{day.rainfallMm} mm rain</p>
                          <p>{day.precipitationChance}% chance</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Weather alerts
                </h4>
              </div>

              <div className="mt-4 space-y-3">
                {data.alerts.length > 0 ? (
                  data.alerts.map((alert) => {
                    const tone = alertTone[alert.severity];

                    return (
                      <div
                        key={`${alert.title}-${alert.message}`}
                        className={`rounded-2xl border p-4 ${tone.bg} ${tone.border}`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`mt-0.5 h-4 w-4 ${tone.text}`} />
                          <div>
                            <p className={`text-sm font-semibold ${tone.text}`}>
                              {alert.title}
                            </p>
                            <p className={`mt-1 text-sm leading-6 ${tone.text}`}>
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                    No severe weather alerts are active. Conditions are stable for regular farm operations.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h4 className="text-sm font-semibold text-gray-900">
                This week at a glance
              </h4>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span>Warmest day</span>
                  <span className="font-semibold text-gray-900">
                    {
                      [...data.forecast].sort(
                        (left, right) => right.maxTempC - left.maxTempC,
                      )[0].dayLabel
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span>Wettest day</span>
                  <span className="font-semibold text-gray-900">
                    {
                      [...data.forecast].sort(
                        (left, right) => right.rainfallMm - left.rainfallMm,
                      )[0].dayLabel
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span>Windiest day</span>
                  <span className="font-semibold text-gray-900">
                    {
                      [...data.forecast].sort(
                        (left, right) => right.windSpeedKph - left.windSpeedKph,
                      )[0].dayLabel
                    }
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </CardBody>
    </Card>
  );
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-harvest-green-100">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

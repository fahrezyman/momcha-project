import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ContentCardsSkeleton({ count = 2, contentHeight = "h-14" }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="border-momcha-peach">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className={`${contentHeight} w-full rounded-lg`} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-momcha-peach">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <Card className="border-momcha-peach">
      <CardContent className="p-0">
        <div className="divide-y divide-momcha-peach">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex">
              <Skeleton className="w-24 h-20 rounded-none shrink-0" />
              <div className="flex-1 p-3 space-y-2">
                <Skeleton className="h-8 w-48" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-momcha-peach">
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </CardContent>
          </Card>
          <Card className="border-momcha-peach">
            <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="border-momcha-peach">
            <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
            <CardContent className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ServicePickerSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <Skeleton className="h-7 w-48 mb-1" />
        <Skeleton className="h-4 w-56" />
      </div>
      <StatCardsSkeleton />
      <ContentCardsSkeleton />
    </div>
  );
}

export function ReportsPageSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <StatCardsSkeleton />
      <ContentCardsSkeleton count={4} contentHeight="h-[250px]" />
    </div>
  );
}

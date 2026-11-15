import { Image } from "@/components/ui/image";
import { BANNER_URL } from "@/lib/brand";

export default function BrandBanner() {
  return (
    <div className="relative w-full overflow-hidden bg-black">
      <Image
        src={BANNER_URL}
        alt="SciOlyCoachAgent — Study, Practice, Excel"
        className="h-[190px] w-full [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)] sm:h-[260px] lg:h-[320px]"
        fittingType="fill"
        focalPointX={0.5}
        focalPointY={0.5}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-background/40 to-background" aria-hidden />
    </div>
  );
}
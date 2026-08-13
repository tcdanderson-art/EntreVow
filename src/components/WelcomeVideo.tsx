import { publicStorageUrl } from "@/lib/storage-url";

export default function WelcomeVideo({ storageKey }: { storageKey: string }) {
  return (
    <div className="mx-5 mt-4">
      <video
        src={publicStorageUrl("videos", storageKey)}
        controls
        playsInline
        className="w-full aspect-video rounded-lg bg-black"
      />
    </div>
  );
}

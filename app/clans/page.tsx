import { getAllClans } from "@/db/queries";
import { ClanCarousel } from "@/app/clans/ClanCarousel";

export default async function ClansPage() {
  const allClans = await getAllClans();

  return (
    <ClanCarousel clans={allClans} />
  );
}

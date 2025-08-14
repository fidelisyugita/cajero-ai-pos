import { Button } from "../components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Cajero POS</h1>
      <Button>Get Started</Button>
    </div>
  );
}

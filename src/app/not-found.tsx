import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
    <p className="font-display text-7xl text-primary">404</p><h1 className="font-display text-3xl uppercase">This page took a rest day.</h1>
    <p className="max-w-md text-muted-foreground">The page may have moved. Your coaching space is one click away.</p>
    <Button asChild><Link href="/">Back to Coach Oussama →</Link></Button>
  </main>;
}

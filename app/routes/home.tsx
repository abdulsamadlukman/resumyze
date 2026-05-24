import type { Route } from "./+types/home";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "resumyze" },
    { name: "description", content: "smart feedback for your dream job" },
  ];
}

export default function Home() {
  return <main>

    </main>
}



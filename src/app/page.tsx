import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, Sparkles, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Kod Yazmayı
              <span className="block text-primary">Eğlenceli Hale Getir</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Blok tabanlı veya metin tabanlı kodlama ile programlamayı öğren.
              Her yaştan öğrenci ve yetişkin için tasarlandı.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/editor">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Hemen Başla
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/projects">Projeleri Keşfet</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Neden CodeCraft?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Modern araçlar ve eğlenceli yaklaşımla kodlamayı öğrenin
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Code2 className="h-10 w-10" />}
              title="İki Mod, Bir Platform"
              description="Blok tabanlı kodlama ile başla, hazır olduğunda metin tabanlı kodlamaya geç."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Her Yaş İçin"
              description="7'den 70'e, herkes için öğrenme yolculuğu. Kendi hızında ilerle."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10" />}
              title="Anında Sonuç"
              description="Kodunu yaz, hemen çalıştır. Görsel geri bildirim ile öğrenmeyi hızlandır."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold">Hazır mısın?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            İlk projenizi oluşturmaya başlayın
          </p>
          <Button size="lg" asChild>
            <Link href="/editor">Hemen Başla</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card p-8 transition-all hover:shadow-lg">
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

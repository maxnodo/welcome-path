import { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  icon: LucideIcon;
}

const PlaceholderPage = ({ title, icon: Icon }: PlaceholderPageProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
      <Icon size={32} className="text-muted-foreground" />
    </div>
    <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
    <p className="text-muted-foreground mt-2">Sección en construcción</p>
  </div>
);

export default PlaceholderPage;

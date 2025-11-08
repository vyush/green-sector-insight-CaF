import { Card, CardContent } from "@/components/ui/card";
import { Linkedin, Mail } from "lucide-react";

type Member = {
  name: string;
  role: string;
  img?: string;
  bio?: string;
  linkedin?: string;
  email?: string;
  placeholder?: boolean;
};

const team: Member[] = [
  {
    name: "Vyush Agarwal",
    role: "Data & Modeling",
    img: "/team/member-a.png", // place your first image here
    bio: "Works on plant targets, intensity models, and forecasting.",
    linkedin: "https://www.linkedin.com/in/vyush/",
  },
  {
    name: "Rohin Gupta",
    role: "Frontend Engineering",
    img: "/team/member-b.png", // place your second image here
    bio: "Builds delightful UI and interactions with performance in mind.",
    linkedin: "https://www.linkedin.com/in/rohingupta1999/",
  },
  {
    name: "Aniruddha Latkar",
    role: "Research & Ops",
    img: "/team/member-c.png", // place your third image here
    bio: "Collects BRSR and Gazette data; maintains the dataset pipeline.",
    linkedin: "https://www.linkedin.com/in/aniruddha-latkar-87535b179/",
  },
  {
    name: "Sushil Kumar",
    role: "Research & Ops",
    img: "/team/member-d.png", // place your fourth image here
    bio: "Develops the AI assistant for data validation and insights.",
    linkedin: "https://www.linkedin.com/in/sushil-kumar-5b10b114a/",
  },
  {
    name: "Kishan Agarwal",
    role: "Research & Ops",
    img: "/team/member-e.png", // place your fifth image here
    bio: "Collects BRSR and Gazette data; maintains the dataset pipeline.",
    linkedin: "https://www.linkedin.com/in/kishan-agarwal-59a467152/",
  }
];

function TeamCard({ m }: { m: Member }) {
  if (m.placeholder) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/30 bg-gradient-to-b from-muted/40 to-transparent">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-3">
          <div className="h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/30 grid place-items-center text-xs text-muted-foreground">
            TBD
          </div>
          <div className="space-y-1">
            <div className="font-semibold opacity-70">{m.name}</div>
            <div className="text-xs text-muted-foreground">{m.role}</div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            Slot reserved
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden group border-border bg-background/60 backdrop-blur-sm hover:shadow-xl transition-all">
      {/* gradient edge */}
      <div className="pointer-events-none absolute inset-x-0 -top-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60 group-hover:opacity-100" />
      <CardContent className="pt-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary/30 via-accent/30 to-transparent blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
            <img
              src={m.img}
              alt="Team member"
              className="relative h-28 w-28 rounded-full object-cover ring-2 ring-primary/30 shadow-md"
            />
          </div>
          <div className="mt-4">
            <div className="text-lg font-semibold">{m.name}</div>
            <div className="text-sm text-muted-foreground">{m.role}</div>
          </div>
          {m.bio && <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>}
          <div className="mt-4 flex items-center gap-3">
            {m.linkedin && (
              <a
                href={m.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-accent transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {m.email && (
              <a
                href={`mailto:${m.email}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-accent transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MeetTheTeam() {
  return (
    <div className="relative">
      {/* soft gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,hsl(var(--primary)/0.1),transparent),radial-gradient(40%_30%_at_80%_0%,hsl(var(--accent)/0.12),transparent)]" />
      <div className="relative space-y-8">
        <header className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Meet the Team
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            The people behind the Carbon Compliance Tracker—data, engineering, and research working together.
          </p>
        </header>

        {/* responsive grid with 5 cards (3 members + 2 placeholders) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {team.map((m) => (
            <TeamCard key={m.name + (m.placeholder ? "-placeholder" : "")} m={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
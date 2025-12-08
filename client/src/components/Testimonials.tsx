import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    quote: "This platform changed how I study! The visualizations make even the hardest concepts easy to understand.",
    name: "Aarav Patel",
    role: "Class 10 Student",
    initial: "A"
  },
  {
    quote: "Best explanations ever! My daughter used to struggle with Science, but now she loves it thanks to the interactive lessons.",
    name: "Priya Sharma",
    role: "Class 8 Parent",
    initial: "P"
  },
  {
    quote: "The notes are a lifesaver for last-minute revision. Everything is so organized and beautiful.",
    name: "Rohan Gupta",
    role: "Class 12 Student",
    initial: "R"
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-indigo-50/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Loved by Students & Parents</h2>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Card key={i} className="border-none bg-white shadow-lg hover:shadow-xl transition-all p-2 rounded-2xl">
              <CardContent className="p-6 flex flex-col h-full justify-between">
                <div className="mb-6 relative">
                  <svg className="absolute -top-4 -left-2 w-8 h-8 text-indigo-100 transform -scale-x-100" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9C9.55228 16 10 15.5523 10 15V9C10 8.44772 9.55228 8 9 8H5C4.44772 8 4 8.44772 4 9V18C4 19.6569 5.34315 21 7 21H14.017ZM21.017 21L21.017 18C21.017 16.8954 20.1216 16 19.017 16H16C16.5523 16 17 15.5523 17 15V9C17 8.44772 16.5523 8 16 8H12C11.4477 8 11 8.44772 11 9V18C11 19.6569 12.3431 21 14 21H21.017Z" />
                  </svg>
                  <p className="text-lg italic text-muted-foreground pl-4 relative z-10">{t.quote}</p>
                </div>
                
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-indigo-50">
                  <Avatar className="h-10 w-10 bg-indigo-100 text-indigo-600 font-bold">
                    <AvatarFallback>{t.initial}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-sm">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
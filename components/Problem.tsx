import { Brain, Clock, Shield } from "lucide-react";

const problems = [
  {
    title: "Time-Consuming Manual Work",
    description: "Hours wasted on repetitive Excel tasks like VLOOKUP and pivot tables, taking valuable time away from meaningful analysis and decision-making.",
    icon: Clock,
  },
  {
    title: "Complex Data Operations",
    description: "When handling multiple spreadsheets, a single error can invalidate the entire analysis. Manual data processing is prone to mistakes and becomes increasingly risky with larger datasets.",
    icon: Brain,
  },
  {
    title: "Data Privacy Risks",
    description: "Popular AI tools like ChatGPT require uploading your Excel files to their servers, exposing sensitive business data to potential security and privacy risks.",
    icon: Shield,
  },
];

const Problem = () => {
  return (
    <section className="bg-neutral text-neutral-content">
      <div className="max-w-7xl mx-auto px-8 py-8 md:py-16">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-wider text-green-500 mb-4">
            PROBLEM
          </p>
          <h2 className="font-extrabold text-4xl md:text-5xl tracking-tight mb-6">
            Excel Tasks Shouldn't Eat Up Your Day
          </h2>
          <p className="max-w-xl mx-auto text-lg opacity-90 leading-relaxed">
            According to research, most business professionals spend several hours each week on repetitive Excel tasks that could be automated
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div key={index} className="bg-neutral-focus rounded-lg p-6 space-y-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <problem.icon className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">{problem.title}</h3>
              <p className="text-neutral-content/80">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;

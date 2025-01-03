const features = [
  {
    icon: "🗣️",
    title: "Multiple Voices",
    description: "Choose from various AI characters ",
  },
  {
    icon: "📱",
    title: "Easy Scheduling",
    description: "Set up calls at your preferred time",
  },
  {
    icon: "🎭",
    title: "Voices",
    description: "Santa, Arnold*, and more!",
  },
  {
    icon: "🎤",
    title: "Voice Cloning",
    description: "Create your own AI voice in 30 seconds",
  },
];

function Features() {
  return (
    <section className="py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <div className="rounded-lg bg-purple-100 p-6 text-center">
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default Features;

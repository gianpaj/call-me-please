const voices = [
  {
    name: "Santa Claus",
    description: "Ho ho ho! Get wake-up calls from Santa himself",
  },
  {
    name: "Arnold",
    description: "Get motivated with the Terminator's voice",
  },
  {
    name: "Tarot Reader",
    description: "Start your day with mystical predictions",
  },
  {
    name: "Pikachu",
    description: "Wake up to your favorite Pokemon character",
  },
];

function VoiceList() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-2xl font-bold">Available Voices</h2>
        <div className="grid gap-4">
          {voices.map((voice) => (
            <div className="rounded-lg bg-white p-4 shadow">
              <h3 className="font-bold">{voice.name}</h3>
              <p className="text-gray-600">{voice.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VoiceList;

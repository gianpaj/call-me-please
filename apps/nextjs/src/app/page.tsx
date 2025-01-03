// eslint-disable @next/next/no-img-element */
import TallyForm from "~/_components/tally-form";
import Banner from "./_components/Banner";
import Features from "./_components/Features";
import Footer from "./_components/Footer";
import Hero from "./_components/Hero";

// import VoiceList from "./_components/VoiceList";

function DownloadButtons() {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 justify-center gap-2 sm:grid-cols-2 sm:gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-40 cursor-not-allowed"
          fetchPriority="high"
          src="/apple-store-logo.avif"
          alt="Download Apple Store Logo"
          title="coming soon ;)"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-40 cursor-not-allowed"
          fetchPriority="high"
          src="/play-store-logo.avif"
          alt="Download Google Play Store Logo"
          title="coming soon ;)"
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Banner />
      <main className="container h-screen py-16">
        <div className="flex flex-col items-center justify-center gap-8">
          <Hero />
          <DownloadButtons />
          <Features />
          {/* <VoiceList /> */}
          {/* <AuthShowcase /> */}

          <TallyForm />
          <DownloadButtons />
          <Footer />
        </div>
      </main>
    </>
  );
}

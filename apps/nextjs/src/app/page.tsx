// eslint-disable @next/next/no-img-element */
import TallyForm from "~/_components/tally-form";

export default function HomePage() {
  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Wake<span className="text-primary">Call</span> app 📞🤖
        </h1>
        {/* <AuthShowcase /> */}

        <TallyForm />
        <div className="w-full max-w-2xl overflow-y-scroll">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <img
              className="w-40 cursor-not-allowed"
              fetchPriority="high"
              src="/apple-store-logo.avif"
              alt="Download Apple Store Logo"
            />
            <img
              className="w-40 cursor-not-allowed"
              fetchPriority="high"
              src="/play-store-logo.avif"
              alt="Download Google Play Store Logo"
            />
          </div>
          {/* <Suspense
              fallback={
                <div className="flex w-full flex-col gap-4">
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </div>
              }
            >
              <PostList />
            </Suspense> */}
        </div>
      </div>
    </main>
  );
}

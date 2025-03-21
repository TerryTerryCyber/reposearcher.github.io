import { GitHubRepoSearcher } from "@/components/github-repo-searcher"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">GitHub Repository Searcher</h1>
      <GitHubRepoSearcher />
    </main>
  )
}


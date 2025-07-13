import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Image, Loader2, Search as SearchIcon, Video } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// import TypingAnimation from "@/components/magicui/typing-animation";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useAuthStore } from "@/store/authStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


interface Source {
    title: string;
    link: string;
    snippet: string;
    source: string;
    favicon: string;
}

interface SearchResponse {
    summary: string;
    sources: Source[];
    media: {
        images: string[];
        videos: string[];
    };
}

// Main Search Component
export function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const { user } = useAuthStore()
    const userName = user?.name || "Guest";

    function SkeletonLoader({ hasSearched }: { hasSearched: boolean }) {
        return (
            <div className="relative w-full min-h-[50vh] mx-auto p-4 flex flex-col gap-6 ">
                {/* Search Results and Media Sidebar Skeleton (shown when search is in progress) */}
                {hasSearched && (
                    <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
                        <div>
                            <Card className="shadow-lg bg-background border-border">
                                <CardHeader>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {Array(4)
                                            .fill(0)
                                            .map((_, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3 bg-muted/30 p-3 w-60 rounded-md "
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <Skeleton className="h-4 w-3/4 " />
                                                        <div className="flex items-center justify-between gap-2 mt-2">
                                                            <div className="flex items-center gap-2">
                                                                <Skeleton className="h-6 w-6 rounded-full " />
                                                                <Skeleton className="h-3 w-20 " />
                                                            </div>
                                                            <Skeleton className="h-3 w-4 " />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-1/2  mb-4" />
                                    <Skeleton className="h-5 w-full  mb-2" />
                                    <Skeleton className="h-4 w-5/6  mb-2" />
                                    <Skeleton className="h-4 w-3/4   mb-2" />
                                    <Skeleton className="h-4 w-3/4  mb-2" />
                                    <Skeleton className="h-4 w-3/4  mb-2" />
                                    <Skeleton className="h-4 w-3/4  mb-2" />
                                    <Skeleton className="h-4 w-3/4  mb-2 " />
                                    <Skeleton className="h-4 w-3/4   mb-2" />
                                    <Skeleton className="h-4 w-3/4  mb-2" />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            {/* Images Card Skeleton */}
                            <Card className="bg-background border-border">
                                <CardHeader>
                                    <Skeleton className="h-6 w-24 " />
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Array(4)
                                            .fill(0)
                                            .map((_, index) => (
                                                <div key={index} className="relative">
                                                    <Skeleton className="h-24 w-full rounded-md " />
                                                    <Image
                                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground"
                                                        size={32}
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Videos Card Skeleton */}
                            <Card className="bg-background border-border">
                                <CardHeader>
                                    <Skeleton className="h-6 w-24 " />
                                </CardHeader>
                                <CardContent>
                                    {Array(1)
                                        .fill(0)
                                        .map((_, index) => (
                                            <div key={index} className="relative mb-2">
                                                <Skeleton className="h-48 w-full rounded-md" />
                                                <Video
                                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground"
                                                    size={48}
                                                />
                                            </div>
                                        ))}
                                </CardContent>
                            </Card>


                        </div>
                    </div>
                )}
            </div>
        );
    }

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setHasSearched(true);
        try {
            const response = await fetch(`http://localhost:3000/api/overview?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("Failed to fetch search results");
            const data: SearchResponse = await response.json();
            setResults(data);
        } catch (err) {
            setError("An error occurred while fetching results. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <div className="relative w-full min-h-screen/2 mx-auto flex flex-col gap-6 bg-[--color-background] transition-colors duration-300">

            {/* Welcome Message (shown only when no search has been performed) */}
            {!hasSearched && !results && !loading && (
                <div className="flex-grow flex items-center justify-center">
                    <h1 className="text-4xl text-center font-medium text-[--color-foreground]">
                        Welcome Back,
                        <div>
                            {/* <TypingAnimation>  */}
                            {userName} !
                            {/* </TypingAnimation>  */}

                        </div>
                    </h1>
                </div>
            )}

            {/* Results or Skeleton Loader */}
            {loading ? (
                loading && <SkeletonLoader hasSearched={hasSearched} />
            ) : results ? (
                <div className={`grid grid-cols-1 lg:grid-cols-[3fr_${results.media?.images?.length > 0 || results.media?.videos?.length > 0 ? '1' :
                    '0'
                    }fr] gap-6`} >
                    {/* Left Column: Summary and Sources */}
                    <div>
                        <SearchResults summary={results.summary} sources={results.sources} />
                    </div>

                    {/* Right Column: Media Sidebar */}
                    <div>
                        <MediaSidebar media={results.media} />
                    </div>
                </div>
            ) : hasSearched ? (
                <div className="text-center text-[--color-muted-foreground] flex-grow">No results found. Try a different query.</div>
            ) : null}

            {/* Error */}
            {error && <div className="text-[--color-destructive] text-center">{error}</div>}

            {/* Fixed Bottom Search Bar */}
            <div className="fixed bottom-4 left-0 right-0 w-[100vw] md:w-[50vw]  mx-auto px-4">
                <div className="flex gap-2 bg-[--color-card] p-3 rounded-3xl shadow-lg backdrop-blur-sm border border-[--color-border] transition-all duration-300 hover:shadow-xl">
                    <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                    <Input
                        type="text"
                        placeholder="Search for anything..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="text-base bg-transparent border-none focus:ring-0 focus-visible:ring-0 text-[--color-foreground] placeholder-[--color-muted-foreground] transition-colors duration-300"
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="bg-[--color-primary] text-[--color-primary-foreground] hover:bg-[--color-primary]/90 rounded-[--radius-md] transition-all duration-300"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <SearchIcon className="w-6 h-6" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}



// Markdown Renderer
const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ node, ...props }) => (
                    <h1 className="text-3xl font-bold mt-6 mb-4 text-[--color-foreground]" {...props} />
                ),
                h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-semibold mt-5 mb-3 text-[--color-foreground]" {...props} />
                ),
                p: ({ node, ...props }) => (
                    <p className="text-[--color-muted-foreground] mb-4 leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside mb-4 text-[--color-muted-foreground]" {...props} />
                ),
                li: ({ node, ...props }) => (
                    <li className="mb-2" {...props} />
                ),
                a: ({ node, ...props }) => (
                    <a className="text-[--color-primary] hover:underline" {...props} />
                ),
                code: ({ node, inline, ...props }: any) => (
                    inline ? (
                        <code className="bg-[--color-muted] text-[--color-foreground] px-1 rounded" {...props} />
                    ) : (
                        <pre className="bg-[--color-muted] p-4 rounded-[--radius-md] overflow-x-auto">
                            <code className="text-[--color-foreground]" {...props} />
                        </pre>
                    )
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
};


function SearchResults({ summary, sources }: { summary: string, sources: Source[] }) {
    const [showAll, setShowAll] = useState(false);
    const displayedSources = sources;

    return (
        <div>
            <Card className="shadow-lg bg-[--color-card] border-[--color-border] transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 ">
                        {displayedSources?.map((source, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 bg-[--color-muted]/30 p-3 w-60 transition-all duration-300 hover:bg-[--color-muted]/50 border rounded-md hover:shadow-md"
                            >
                                <div className="flex-1 min-w-0">
                                    <a
                                        href={source.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[--color-primary] hover:underline text-sm font-medium block truncate"
                                    >
                                        <Tooltip>
                                            <TooltipTrigger>{source.title}</TooltipTrigger>
                                            <TooltipContent>
                                                <p>{source.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </a>
                                    <div className="flex items-center justify-between gap-2 mt-2">
                                        <div className="flex items-center gap-2 text-xs text-[--color-muted-foreground] truncate">
                                            <Avatar className="h-6 w-6 flex-shrink-0">
                                                <AvatarImage src={source.favicon} alt={source.source} />
                                                <AvatarFallback>{source.source[0]}</AvatarFallback>
                                            </Avatar>
                                            {source.source}
                                        </div>
                                        <div className="text-[--color-muted-foreground]">{index + 1}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="pb-12">
                    <MarkdownRenderer content={summary} />
                </CardContent>
            </Card>
        </div>
    );
}

// Media Sidebar Component
function MediaSidebar({ media }: { media: { images: string[]; videos: string[] } }) {
    return (
        <div className="space-y-4">
            {media.images.length > 0 && (
                <Card className="bg-[--color-card] border-[--color-border] transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-[--color-card-foreground]">Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            {media.images.slice(0, 6).map((image, index) => (
                                <div key={index} className="relative h-20overflow-hidden rounded-[--radius-md]">
                                    <img
                                        src={image}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 rounded-md"

                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
            {media.videos.length > 0 && (
                <Card className="mt-4 bg-[--color-card] border-[--color-border] transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-[--color-card-foreground]">Videos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {media.videos.slice(0, 4).map((video, index) => (
                            <div key={index} className="mt-2">
                                {video.startsWith("https://www.youtube.com") ? (
                                    <iframe
                                        src={video.replace("watch?v=", "embed/")}
                                        title={`Video ${index + 1}`}
                                        width="100%"
                                        height="200"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="rounded-[--radius-md]"
                                    ></iframe>
                                ) : (
                                    <video controls className="w-full h-48 rounded-[--radius-md]">
                                        <source src={video} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
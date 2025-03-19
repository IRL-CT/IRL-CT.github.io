import Fuse from "fuse.js";
import { useEffect, useRef, useState, useMemo, type FormEvent } from "react";
import type { CollectionEntry } from "astro:content";

export type SearchItem = {
  title: string;
  description: string;
  authors?: string;
  venue?: string;
  data: CollectionEntry<"publications" | "projects" | "team">["data"];
  slug: string;
  collection: "publications" | "projects" | "team";
  displayDate?: string;
  searchContent?: string;
};

interface Props {
  searchList: SearchItem[];
}

interface SearchResult {
  item: SearchItem;
  refIndex: number;
}

export default function SearchBar({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  );

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'authors', weight: 2.5 }, // Increased weight for author matches
          { name: 'searchContent', weight: 1 }
        ],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.4, // More permissive threshold for author name matching
        ignoreLocation: true, // Ignore where in the string the match occurs
        location: 0,
        distance: 1000, // Increased for longer texts
        useExtendedSearch: true, // Enable extended search capabilities
      }),
    [searchList]
  );

  useEffect(() => {
    // if URL has search query,
    // insert that search query in input field
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    // put focus cursor at the end of the string
    setTimeout(function () {
      inputRef.current!.selectionStart = inputRef.current!.selectionEnd =
        searchStr?.length || 0;
    }, 50);
  }, []);

  useEffect(() => {
    // Add search result only if
    // input value is more than one character
    const inputResult = inputVal.length > 1 ? fuse.search(inputVal) : [];
    setSearchResults(inputResult);

    // Update search string in URL
    if (inputVal.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", inputVal);
      const newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
      history.replaceState(history.state, "", newRelativePathQuery);
    } else {
      history.replaceState(history.state, "", window.location.pathname);
    }
  }, [inputVal]);

  useEffect(() => {
    // focus on text input when search bar is displayed
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputVal]);

  // Function to get the correct URL based on collection type
  const getItemUrl = (item: SearchItem): string => {
    switch (item.collection) {
      case "publications":
        return `/publications/${item.slug}/`;
      case "projects":
        return `/projects/${item.slug}/`;
      case "team":
        return `/team/${item.slug}/`;
      default:
        return `/${item.slug}/`;
    }
  };

  // Function to render custom search result item
  const renderSearchResult = (item: SearchItem) => {
    return (
      <div className="search-result-item my-6 border border-skin-line rounded-lg p-4 hover:bg-skin-card-muted">
        <a href={getItemUrl(item)} className="block">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          
          {item.collection === "publications" && item.authors && (
            <p className="text-sm text-skin-base mt-1">{item.authors}</p>
          )}
          
          {item.displayDate && (
            <p className="text-sm text-skin-base opacity-75 mt-1">
              {item.collection === "publications" && item.venue ? `${item.venue}, ${item.displayDate}` : item.displayDate}
            </p>
          )}
          
          {item.description && (
            <p className="text-skin-base mt-2">
              {item.description.length > 200 
                ? `${item.description.substring(0, 200)}...` 
                : item.description}
            </p>
          )}
          
          <span className="inline-block mt-2 text-sm bg-skin-accent text-skin-inverted px-2 py-1 rounded">
            {item.collection === "publications" ? "Publication" : 
             item.collection === "projects" ? "Project" : "Team Member"}
          </span>
        </a>
      </div>
    );
  };

  return (
    <>
      <label className="relative block">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2 opacity-75">
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"></path>
          </svg>
          <span className="sr-only">Search</span>
        </span>
        <input
          className="block w-full rounded border border-skin-fill/40 bg-skin-fill py-3 pl-10 pr-3 placeholder:italic focus:border-skin-accent focus:outline-none"
          placeholder="Search publications, projects, and team members..."
          type="text"
          name="search"
          value={inputVal}
          onChange={handleChange}
          autoComplete="off"
          ref={inputRef}
        />
      </label>

      {inputVal.length > 1 && (
        <div className="mt-8">
          Found {searchResults?.length}
          {searchResults?.length && searchResults?.length === 1
            ? " result"
            : " results"}{" "}
          for '{inputVal}'
        </div>
      )}

      <div className="mt-6">
        {searchResults && searchResults.map(({ item, refIndex }) => (
          <div key={`${refIndex}-${item.slug}`}>
            {renderSearchResult(item)}
          </div>
        ))}
      </div>
    </>
  );
}

import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  project: CollectionEntry<"projects">["data"];
  secHeading?: boolean;
}

export default function ProjectCard({ href, project, secHeading = true }: Props) {
  const {title, summary, startDate, tags, image } = project;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 {...headerProps}>{title}</h2>
        ) : (
          <h3 {...headerProps}>{title}</h3>
        )}
      </a>
      
      <div className="flex items-center gap-2 mt-1">
        
        {startDate && 
          <span className="text-sm text-gray-600">
            Started: {new Date(startDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
            })}
          </span>
        }
      </div>
      
      <p className="mt-2 text-base">{summary}</p>

      <div className="mt-2">
        {tags.map(tag => (
          <span 
            key={tag} 
            className="inline-block px-2 py-0.5 mr-2 mb-1 text-xs bg-gray-100 text-gray-800 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </li>
  );
}
import { Link } from "react-router-dom";

export default function ProjectRow({ project }) {
    return (
        <li>
            <Link
                to={`/projects/${project.slug}`}
                className="group grid gap-4 border-t border-line py-6 sm:grid-cols-[13rem_1fr] sm:gap-8"
            >
                <div className="aspect-[16/10] overflow-hidden rounded-md bg-line/40">
                    {project.cover_image_url ? (
                        <img
                            src={project.cover_image_url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover object-top"
                        />
                    ) : (
                        <div className="grid h-full place-items-center font-display text-5xl font-bold text-ink/20">
                            {project.title[0]}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight group-hover:text-accent-ink">
                        {project.title}
                    </h3>
                    <p className="mt-1.5 text-muted">{project.summary}</p>
                    <p className="mt-3 text-sm text-ink/80">{project.tools.join(", ")}</p>
                </div>
            </Link>
        </li>
    );
}
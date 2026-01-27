"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { projects } from "../page";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.id;

  // find the project by id
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold text-textSecondary">
          Project Not Found
        </h1>
      </div>
    );
  }

  // Example media gallery per project
  const gallery = project.media || [
    // fallback dummy media if none defined
    { type: "image", src: "/images/placeholder1.jpg" },
    { type: "image", src: "/images/placeholder2.jpg" },
    { type: "video", src: "/videos/placeholder.mp4" },
  ];

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      {/* Project Header */}
      <div className="mb-16 text-center">
        <span className="text-primary font-bold flex items-center justify-center mb-2">
          <Calendar className="w-5 h-5 mr-2" /> {project.year}
        </span>
        <h1 className="text-5xl font-black mb-4">{project.title}</h1>
        <span className="px-4 py-1 bg-surface rounded-full text-sm font-bold text-textSecondary uppercase tracking-wider">
          {project.category}
        </span>
        <p className="text-textSecondary mt-6 max-w-3xl mx-auto">
          {project.desc}
        </p>
      </div>

      {/* Media Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((item, idx) => (
          <div key={idx} className="rounded-2xl overflow-hidden shadow-lg">
            {item.type === "image" ? (
              item.isExternal ? (
                <Image
                  unoptimized
                  src={item.src}
                  alt={`Media ${idx + 1}`}
                  className="w-full h-64 object-cover fill"
                  width={300}
                  height={300}
                />
              ) : (
                <Image
                  src={item.src}
                  alt={`Media ${idx + 1}`}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover"
                />
              )
            ) : (
              <video
                src={item.src}
                controls
                className="w-full h-64 object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

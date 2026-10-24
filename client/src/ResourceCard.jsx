import React from "react";
import { ArrowUpRight, MapPin, Users } from "lucide-react";

import { Icon } from "./ui";
const categoryImages = {
  "Study room": "/images/study-room.webp",
  "Creative space": "/images/creative-studio.webp",
  Equipment: "/images/equipment.webp",
};
export default function ResourceCard({ resource, onOpen }) {
  const image =
    resource.name === "Innovation Lab"
      ? categoryImages["Study room"]
      : categoryImages[resource.category];
  return (
    <article className="resource-card">
      <div
        className={`resource-art ${resource.category === "Equipment" ? "sand" : resource.category === "Creative space" ? "rose" : "sage"}`}
      >
        {image ? (
          <img
            src={image}
            alt={`Illustration of ${resource.category.toLowerCase()} facilities`}
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Icon category={resource.category} size={76} strokeWidth={1} />
        )}
        <span className="art-tag">{resource.category}</span>
      </div>
      <div className="card-body">
        <div className="card-top">
          <span className={`badge ${resource.approvalRequired ? "amber" : ""}`}>
            {resource.approvalRequired
              ? "Approval required"
              : "Instant booking"}
          </span>
          <span className="capacity">
            <Users size={14} /> {resource.capacity}
          </span>
        </div>
        <h3>{resource.name}</h3>
        <p className="location">
          <MapPin size={14} />
          {resource.location}
        </p>
        <p className="description">{resource.description}</p>
        <div className="features">
          {resource.features.slice(0, 3).map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
        <button className="card-action" onClick={() => onOpen(resource)}>
          View availability
          <ArrowUpRight size={18} />
        </button>
      </div>
    </article>
  );
}

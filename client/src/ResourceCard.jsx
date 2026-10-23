import React, { useState, useEffect } from "react";
import { ArrowUpRight, MapPin, Users } from "lucide-react";

import { Icon } from "./ui";
const categories = ["All", "Study room", "Creative space", "Equipment"];
export default function ResourceCard({ resource, onOpen }) {
  return (
    <article className="resource-card">
      <div
        className={`resource-art ${resource.category === "Equipment" ? "sand" : resource.category === "Creative space" ? "rose" : "sage"}`}
      >
        <div className="art-grid" />
        <Icon category={resource.category} size={76} strokeWidth={1} />
        <span className="art-tag">{resource.category}</span>
        <span className="art-code">
          CS / {resource.name.slice(0, 2).toUpperCase()}
        </span>
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

"use client";

import type { ComponentType } from "react";
import { RoughWorkPad } from "./RoughWorkPad";
import { XpFigure } from "./XpFigure";
import { EnsembleFigure } from "./EnsembleFigure";
import { GeofenceFigure } from "./GeofenceFigure";
import { RouteFigure } from "./RouteFigure";
import { MoodFigure } from "./MoodFigure";

type FigureProps = { active: boolean };

// One live figure per project slug. `active` is true while its page is open.
export const PROJECT_FIGURES: Record<string, ComponentType<FigureProps>> = {
  holodraw: () => <RoughWorkPad />,
  "gym-leveling": XpFigure,
  "boxoffice-predictor": EnsembleFigure,
  "geofenced-qr-attendance": GeofenceFigure,
  "sri-lanka-shortest-path": RouteFigure,
  "emotion-music-recommender": MoodFigure,
};

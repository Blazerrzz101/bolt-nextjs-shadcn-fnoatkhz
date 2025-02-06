<<<<<<< HEAD
import { Product } from "./product"
import { Review } from "./review"
import { Thread } from "./thread"
import { Poll } from "./poll"

export type { Product } from "./product"
export type { Review } from "./review"
export type { Thread } from "./thread"
export type { Poll } from "./poll"
=======
export type VoteType = "up" | "down" | null;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rank: number;
  votes: number;
  userVote: VoteType | null;
}
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)

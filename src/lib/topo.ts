// Candidates for the top of the home page while the owners move away from the sea. Picked with ?topo= so they can
// be compared on the same build; TOPO_PADRAO is what everyone else sees. (Kept out of the client component so the
// server page can read the list itself.)
export type Topo = "mar" | "feltro" | "lookbook" | "vitrine";
export const TOPOS: Topo[] = ["mar", "feltro", "lookbook", "vitrine"];
export const TOPO_PADRAO: Topo = "mar";

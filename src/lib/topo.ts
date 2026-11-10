// Candidates for the top of the home page. Picked with ?topo= so they can be compared on the same build;
// TOPO_PADRAO is what everyone else sees. (Kept out of the client component so the server page can read the list.)
// "as" = option 11 of the options page (giant ace), "naipes" = 26 (suits on the waves), "mar-vinho" = 16/30 (the sea
// video recoloured in wine). The default is the simplest one: low visual complexity reads best at first glance
// (Tuch et al. 2012, docs/PESQUISA-UX.md).
export type Topo = "as" | "naipes" | "mar-vinho" | "mar" | "feltro" | "lookbook" | "vitrine";
export const TOPOS: Topo[] = ["as", "naipes", "mar-vinho", "mar", "feltro", "lookbook", "vitrine"];
export const TOPO_PADRAO: Topo = "as";

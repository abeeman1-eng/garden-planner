// Curated companion-planting relationships (spec 3.2).
// Each rule pairs two "selectors" and marks them good or bad, with a reason
// shown to the user. A selector matches by plant `key` or by `family`:
//   { plant: 'tomato' }        -> matches only tomato
//   { family: 'brassicaceae' } -> matches any plant in that family
//
// The engine treats rules as symmetric (a next to b == b next to a), so define
// each pairing once. Add rows freely and re-run `npm run seed`.

export const COMPANION_RULES = [
  // ---------------- BAD / avoid ----------------
  { a: { plant: 'tomato' },  b: { family: 'brassicaceae' }, relationship: 'bad',
    reason: 'Tomatoes and brassicas compete heavily and stunt each other; keep them apart.' },
  { a: { plant: 'tomato' },  b: { plant: 'potato' }, relationship: 'bad',
    reason: 'Both nightshades share early/late blight and pests — planting them together amplifies disease.' },
  { a: { plant: 'tomato' },  b: { plant: 'corn' }, relationship: 'bad',
    reason: 'Corn earworm and tomato fruitworm are the same pest; adjacency invites shared infestation.' },
  { a: { plant: 'tomato' },  b: { plant: 'fennel' }, relationship: 'bad',
    reason: 'Fennel secretes compounds that inhibit tomato growth.' },
  { a: { family: 'fabaceae' }, b: { family: 'amaryllidaceae' }, relationship: 'bad',
    reason: 'Alliums (onion/garlic/leek) stunt beans and peas.' },
  { a: { plant: 'potato' },  b: { family: 'cucurbitaceae' }, relationship: 'bad',
    reason: 'Potatoes near cucurbits worsen susceptibility to blight and share pest pressure.' },
  { a: { plant: 'potato' },  b: { plant: 'tomato' }, relationship: 'bad',
    reason: 'Both nightshades — shared blight and Colorado potato beetle pressure.' },
  { a: { plant: 'carrot' },  b: { plant: 'dill' }, relationship: 'bad',
    reason: 'Mature dill can stunt carrots and cross-attract carrot pests.' },
  { a: { plant: 'onion' },   b: { family: 'fabaceae' }, relationship: 'bad',
    reason: 'Onions inhibit the growth of beans and peas.' },
  { a: { plant: 'cabbage' }, b: { plant: 'strawberry' }, relationship: 'bad',
    reason: 'Brassicas and strawberries compete and share pests; keep separated.' },

  // ---------------- GOOD / beneficial ----------------
  { a: { plant: 'tomato' },  b: { plant: 'basil' }, relationship: 'good',
    reason: 'Basil is said to improve tomato vigor and repels some tomato pests.' },
  { a: { plant: 'tomato' },  b: { plant: 'marigold' }, relationship: 'good',
    reason: 'Marigolds deter nematodes and hornworms around tomatoes.' },
  { a: { plant: 'tomato' },  b: { plant: 'carrot' }, relationship: 'good',
    reason: 'Carrots loosen soil for tomato roots; compatible neighbors.' },
  { a: { plant: 'carrot' },  b: { plant: 'onion' }, relationship: 'good',
    reason: 'Onions help mask carrots from the carrot rust fly.' },
  { a: { plant: 'carrot' },  b: { plant: 'lettuce' }, relationship: 'good',
    reason: 'Compatible spacing and root depths; classic interplanting pair.' },
  { a: { family: 'fabaceae' }, b: { plant: 'corn' }, relationship: 'good',
    reason: 'Beans fix nitrogen for corn and can climb the stalks (Three Sisters).' },
  { a: { plant: 'corn' },    b: { family: 'cucurbitaceae' }, relationship: 'good',
    reason: 'Sprawling squash shades soil and deters pests around corn (Three Sisters).' },
  { a: { family: 'fabaceae' }, b: { family: 'cucurbitaceae' }, relationship: 'good',
    reason: 'Legumes enrich soil nitrogen that heavy-feeding cucurbits use.' },
  { a: { plant: 'cucumber' }, b: { plant: 'radish' }, relationship: 'good',
    reason: 'Radishes deter cucumber beetles when interplanted.' },
  { a: { family: 'brassicaceae' }, b: { plant: 'onion' }, relationship: 'good',
    reason: 'Alliums help repel cabbage moths and aphids from brassicas.' },
  { a: { family: 'brassicaceae' }, b: { plant: 'dill' }, relationship: 'good',
    reason: 'Dill attracts predatory wasps that control cabbage worms.' },
  { a: { plant: 'marigold' }, b: { family: 'cucurbitaceae' }, relationship: 'good',
    reason: 'Marigolds deter beetles and nematodes around cucurbits.' },
  { a: { plant: 'lettuce' },  b: { family: 'fabaceae' }, relationship: 'good',
    reason: 'Beans/peas fix nitrogen that leafy lettuce appreciates.' },
  { a: { plant: 'strawberry' }, b: { family: 'fabaceae' }, relationship: 'good',
    reason: 'Beans fix nitrogen and are traditional strawberry companions.' },

  // ---- New-crop rules ----
  { a: { plant: 'nasturtium' }, b: { family: 'cucurbitaceae' }, relationship: 'good',
    reason: 'Nasturtiums trap aphids and deter squash bugs and cucumber beetles.' },
  { a: { plant: 'nasturtium' }, b: { plant: 'tomato' }, relationship: 'good',
    reason: 'Nasturtiums lure aphids away from tomatoes.' },
  { a: { plant: 'borage' }, b: { plant: 'tomato' }, relationship: 'good',
    reason: 'Borage deters tomato hornworms and attracts pollinators.' },
  { a: { plant: 'borage' }, b: { plant: 'strawberry' }, relationship: 'good',
    reason: 'Borage is a classic strawberry companion that boosts pollination.' },
  { a: { plant: 'calendula' }, b: { plant: 'tomato' }, relationship: 'good',
    reason: 'Calendula traps aphids and draws in beneficial insects.' },
  { a: { plant: 'cilantro' }, b: { family: 'brassicaceae' }, relationship: 'good',
    reason: 'Cilantro flowers attract wasps that prey on cabbage pests.' },
  { a: { plant: 'fennel' }, b: { family: 'fabaceae' }, relationship: 'bad',
    reason: 'Fennel is allelopathic and inhibits beans and peas — keep it isolated.' },
  { a: { plant: 'fennel' }, b: { family: 'cucurbitaceae' }, relationship: 'bad',
    reason: 'Fennel inhibits the growth of most vegetables, including cucurbits.' },
  { a: { plant: 'dill' }, b: { plant: 'cucumber' }, relationship: 'good',
    reason: 'Dill attracts beneficial insects and is said to improve cucumber flavor.' }
];

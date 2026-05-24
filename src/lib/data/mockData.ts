import type { Prompt, Product, Blog } from '@/lib/types'

interface HomeProduct {
  id: string
  title: string
  description: string
  icon: string
  link: string
}

interface HomeBlog {
  id: string
  title: string
  excerpt: string
  icon: string
  link: string
}

interface HomePrompt {
  id: string
  title: string
  description: string
  image: string
  reelLink: string
  promptLink: string
}

export const PROMPTS: Prompt[] = [
  {
    id: 'liquid-chrome-geometry',
    title: 'Liquid Chrome Geometry',
    description: 'Generate hyper-realistic 3D primitive shapes with liquid chrome materials in a stark, infinite studio environment.',
    category: 'AI Visuals',
    tool: 'Midjourney v6',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOTX8fdE07Xs2xlJrYy8xLXUAE447yLcBV0-Kcylqe9gVAq7Msy9URzj3UH8Lvu7zF3QLE7goW7ze-fYYumrn5xgp_kiVxRy0rSkC5Z7GdtmfKD4ZNrb93d9VzjW6LAh76ckapMjTzCqOCxzw_h9huR0C-DDnIixz2hsv_ImRCs9wEosJC7Hqlsflh8aUIcFLx_dZZUazDjirEgnoZiqqOjD8Y5p5UUGdL4bxEoY1CrYmu_E0qgcuRcVi_hYfwaHT2_hYPyBuIJ6w',
    promptLink: 'https://gumroad.com',
  },
  {
    id: 'neon-noir-terminals',
    title: 'Neon Noir Terminals',
    description: 'Moody, high-contrast scenes of retro-futuristic workstations lit by single-source colored neon lights.',
    category: 'Cinematic Prompts',
    tool: 'Stable Diffusion',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASuSTGzoIxVSowE8ODanJDKi9VK0kVaA6XbVaGSJkT-K7l1mvI-3oyqlKyNmQdt97HBsws3Q2IHcezkSXa3Y2W6UXw457zuLtcMMjox9u-U3e_0pP02yZ4YA1n9C_DRLLl-EGTdpkYaxQePFiDhxfmXw4Ly71N4PnAEajbq7-HeINHjIBH9hfmUeflwuNoRhyfSyDi42bLlxbwPM-ms13dTt7EBF-NOIdRCHbSdrcSVEz0W0bQNKaIpnxEd0ufRd9C1BkN57JPbh8',
    promptLink: 'https://gumroad.com',
  },
  {
    id: 'frosted-glass-interfaces',
    title: 'Frosted Glass Interfaces',
    description: 'Concepts for spatial computing UIs featuring deep background blurs and razor-sharp white typography.',
    category: 'UI Design',
    tool: 'DALL-E 3',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGwD7JvXoXcqL4XarGve_vGc9Ebzo9IG0DfcCB9hQbWs6kH8OuE-Ox0RqOt_Ly6RAl-exVoO6lDtMA--xMFDYRalJsaXGbEVcpwZ-Ptjq2bc4swOIDBKvWLo14N_R1cjf91foQ4HuKwjLp82LlIBKJsJ_d-tNganki2No433n4e1rleOvEeHUw5IQdmhQWxa8OX4a7N6JHOrJMJo5UDKlOe74UIKRTT79Qn_saWSsqS5tmIw8LQag5vH9-V3fb5RjI531p0-Z0Zn0',
    promptLink: 'https://gumroad.com',
  },
  {
    id: 'cinematic-midjourney-masters',
    title: 'Cinematic Midjourney Masters',
    description: 'A collection of deeply technical prompts to achieve film-like lighting and composition with dramatic depth of field.',
    category: 'Cinematic Prompts',
    tool: 'Midjourney v6',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD26TLTkWNQMpNMXkT61Xvw3jKOZNGCjEEkev_VWuraviUaq8ZKXphXhSYZcnnWRAj1cxgrzTJ7Kj4rOcSfQO7EDXx0jn6QSz0F7mIgA9vv5sqhWAlLi9m3bANlX9OdqthN7xwtBC6VNAmWQ5W-xz4dtWsEAF6eSfBs-AF0aKchAA-YE5WWGcbQHh6b80rX1TsnFQAtAIOxkWEuWWM0GiI1Lfdh0C24yGZVEofRe7CqnfVzGBDlUqYCrt5Dxfi4ZdTazyuWo4A8CtU',
    promptLink: 'https://gumroad.com',
  },
  {
    id: 'hyper-real-lighting-prompts',
    title: 'Hyper-Real Lighting Prompts',
    description: 'Master studio lighting setups within AI generation for product-level realism and precision shadow control.',
    category: 'AI Visuals',
    tool: 'Midjourney v6',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaJRV-pVmT9v8HbKQdLFi7io3jL0s_NuE4u2XNJPc8_Ivly6R2Gu-bUVPqjhaPigp2loqOVkzzRUAI-ZsUrKcZGxOqQfeJFxyuJfhWBvE7lgmy288W33gMulxKbTK-dSVZtNcn9sbQPWa31g5OWk-psRaUXSapkhi80rRSKN7JcejDyQgWR3lsS9EgtDfYLt2UlH-IfXUo7hgDxEx6mE6-yhUaX27vuL0a701nRZ92Pg0Y1HTS6lGNsiNWLNnaiWqgvSFhutzwqy8',
    promptLink: 'https://gumroad.com',
  },
  {
    id: 'workflow-automation-chains',
    title: 'Workflow Automation Chains',
    description: 'Structured prompt sequences for chaining AI tasks into repeatable creative pipelines with consistent output quality.',
    category: 'Workflow Prompts',
    tool: 'ChatGPT-4o',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOTX8fdE07Xs2xlJrYy8xLXUAE447yLcBV0-Kcylqe9gVAq7Msy9URzj3UH8Lvu7zF3QLE7goW7ze-fYYumrn5xgp_kiVxRy0rSkC5Z7GdtmfKD4ZNrb93d9VzjW6LAh76ckapMjTzCqOCxzw_h9huR0C-DDnIixz2hsv_ImRCs9wEosJC7Hqlsflh8aUIcFLx_dZZUazDjirEgnoZiqqOjD8Y5p5UUGdL4bxEoY1CrYmu_E0qgcuRcVi_hYfwaHT2_hYPyBuIJ6w',
    promptLink: 'https://gumroad.com',
  },
]

export const PRODUCTS: Product[] = [
  {
    id: 'obsidian-preset-pack',
    title: 'The Obsidian Preset Pack',
    description: 'A complete cinematic color-grading system built for AI-generated imagery and editorial photography. 52 precision-crafted presets engineered to achieve film-like depth, restrained contrast, and atmospheric tones.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD26TLTkWNQMpNMXkT61Xvw3jKOZNGCjEEkev_VWuraviUaq8ZKXphXhSYZcnnWRAj1cxgrzTJ7Kj4rOcSfQO7EDXx0jn6QSz0F7mIgA9vv5sqhWAlLi9m3bANlX9OdqthN7xwtBC6VNAmWQ5W-xz4dtWsEAF6eSfBs-AF0aKchAA-YE5WWGcbQHh6b80rX1TsnFQAtAIOxkWEuWWM0GiI1Lfdh0C24yGZVEofRe7CqnfVzGBDlUqYCrt5Dxfi4ZdTazyuWo4A8CtU',
    productLink: 'https://gumroad.com',
    category: 'Preset Packs',
    price: '$129',
    badge: 'Flagship · v2.4',
    specs: '52 Presets · Lightroom + Capture One · Instant Download',
    featured: true,
    order: 1,
  },
  {
    id: 'kinetic-typography-engine',
    title: 'Kinetic Typography Engine',
    description: 'Motion-ready type systems for Figma and After Effects. Precision kerning tables, animated reveal presets, and editorial text hierarchies engineered for cinematic presentations.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGwD7JvXoXcqL4XarGve_vGc9Ebzo9IG0DfcCB9hQbWs6kH8OuE-Ox0RqOt_Ly6RAl-exVoO6lDtMA--xMFDYRalJsaXGbEVcpwZ-Ptjq2bc4swOIDBKvWLo14N_R1cjf91foQ4HuKwjLp82LlIBKJsJ_d-tNganki2No433n4e1rleOvEeHUw5IQdmhQWxa8OX4a7N6JHOrJMJo5UDKlOe74UIKRTT79Qn_saWSsqS5tmIw8LQag5vH9-V3fb5RjI531p0-Z0Zn0',
    productLink: 'https://gumroad.com',
    category: 'Typography',
    price: '$49',
    specs: '120 Components · Figma + After Effects · Variable Fonts',
    order: 2,
  },
  {
    id: 'liquid-glass-ui-kit',
    title: 'Liquid Glass UI Kit',
    description: 'A complete Apple-inspired glassmorphism design system for Figma. Spatial UI components, translucent surfaces, and editorial card patterns built for premium digital products.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASuSTGzoIxVSowE8ODanJDKi9VK0kVaA6XbVaGSJkT-K7l1mvI-3oyqlKyNmQdt97HBsws3Q2IHcezkSXa3Y2W6UXw457zuLtcMMjox9u-U3e_0pP02yZ4YA1n9C_DRLLl-EGTdpkYaxQePFiDhxfmXw4Ly71N4PnAEajbq7-HeINHjIBH9hfmUeflwuNoRhyfSyDi42bLlxbwPM-ms13dTt7EBF-NOIdRCHbSdrcSVEz0W0bQNKaIpnxEd0ufRd9C1BkN57JPbh8',
    productLink: 'https://gumroad.com',
    category: 'UI Kits',
    price: '$89',
    specs: '340 Components · Figma · Auto-Layout · Dark Mode',
    order: 3,
  },
  {
    id: 'editorial-soundscapes',
    title: 'Editorial Soundscapes',
    description: 'Atmospheric audio textures and ambient sound beds engineered for creative presentations, portfolio reels, and cinematic video content. Royalty-free, loop-ready.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOTX8fdE07Xs2xlJrYy8xLXUAE447yLcBV0-Kcylqe9gVAq7Msy9URzj3UH8Lvu7zF3QLE7goW7ze-fYYumrn5xgp_kiVxRy0rSkC5Z7GdtmfKD4ZNrb93d9VzjW6LAh76ckapMjTzCqOCxzw_h9huR0C-DDnIixz2hsv_ImRCs9wEosJC7Hqlsflh8aUIcFLx_dZZUazDjirEgnoZiqqOjD8Y5p5UUGdL4bxEoY1CrYmu_E0qgcuRcVi_hYfwaHT2_hYPyBuIJ6w',
    productLink: 'https://gumroad.com',
    category: 'Soundscapes',
    price: '$35',
    specs: '28 Tracks · WAV 48kHz · Royalty-Free · Loop-Ready',
    order: 4,
  },
  {
    id: 'cinematic-depth-guide',
    title: 'Cinematic Depth Mastery',
    description: 'An advanced creator guide to depth-of-field, atmospheric haze, and cinematic framing within AI image generation. Includes annotated prompt breakdowns and reference libraries.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaJRV-pVmT9v8HbKQdLFi7io3jL0s_NuE4u2XNJPc8_Ivly6R2Gu-bUVPqjhaPigp2loqOVkzzRUAI-ZsUrKcZGxOqQfeJFxyuJfhWBvE7lgmy288W33gMulxKbTK-dSVZtNcn9sbQPWa31g5OWk-psRaUXSapkhi80rRSKN7JcejDyQgWR3lsS9EgtDfYLt2UlH-IfXUo7hgDxEx6mE6-yhUaX27vuL0a701nRZ92Pg0Y1HTS6lGNsiNWLNnaiWqgvSFhutzwqy8',
    productLink: 'https://gumroad.com',
    category: 'Guides',
    price: '$69',
    specs: '180 Pages · PDF + EPUB · Lifetime Updates',
    order: 5,
  },
  {
    id: 'pro-studio-presets',
    title: 'Pro Studio Lighting Presets',
    description: 'Studio-grade lighting reference presets optimized for AI image generation prompts. Recreate professional three-point setups, rim-lighting, and Rembrandt lighting in any AI tool.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOTX8fdE07Xs2xlJrYy8xLXUAE447yLcBV0-Kcylqe9gVAq7Msy9URzj3UH8Lvu7zF3QLE7goW7ze-fYYumrn5xgp_kiVxRy0rSkC5Z7GdtmfKD4ZNrb93d9VzjW6LAh76ckapMjTzCqOCxzw_h9huR0C-DDnIixz2hsv_ImRCs9wEosJC7Hqlsflh8aUIcFLx_dZZUazDjirEgnoZiqqOjD8Y5p5UUGdL4bxEoY1CrYmu_E0qgcuRcVi_hYfwaHT2_hYPyBuIJ6w',
    productLink: 'https://gumroad.com',
    category: 'Preset Packs',
    price: '$45',
    specs: '36 Lighting Setups · Midjourney + DALL-E + SD · PDF Reference',
    order: 6,
  },
]

export const FEATURED_PRODUCTS: HomeProduct[] = [
  {
    id: 'mastering-lighting',
    title: 'Mastering Lighting',
    description: 'A comprehensive guide to cinematic lighting in AI image generation.',
    icon: 'lightbulb',
    link: 'https://gumroad.com',
  },
  {
    id: 'prompt-engineering-pro',
    title: 'Prompt Engineering Pro',
    description: 'Advanced techniques for high-fidelity image generation.',
    icon: 'bolt',
    link: 'https://gumroad.com',
  },
  {
    id: 'cinematic-depth-pack',
    title: 'Cinematic Depth Pack',
    description: 'Exclusive depth-of-field and cinematic framing prompts for premium outputs.',
    icon: 'movie_filter',
    link: 'https://gumroad.com',
  },
]

export const FEATURED_BLOGS: HomeBlog[] = [
  {
    id: 'future-of-ai-design',
    title: 'The Future of AI Design',
    excerpt: 'Exploring the intersection of generative AI and traditional design principles.',
    icon: 'article',
    link: 'https://medium.com/@createwithanmol',
  },
  {
    id: 'cinematic-prompting-101',
    title: 'Cinematic Prompting 101',
    excerpt: 'How to achieve film-like quality in every generation.',
    icon: 'movie',
    link: 'https://medium.com/@createwithanmol',
  },
  {
    id: 'midjourney-advanced-techniques',
    title: 'Midjourney Advanced Techniques',
    excerpt: 'From v5 to v6 — what changed and how to adapt your creative workflow.',
    icon: 'auto_awesome',
    link: 'https://medium.com/@createwithanmol',
  },
]

export const FEATURED_PROMPTS: HomePrompt[] = [
  {
    id: 'cinematic-midjourney-masters',
    title: 'Cinematic Midjourney Masters',
    description: 'A collection of deeply technical prompts to achieve film-like lighting and composition.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD26TLTkWNQMpNMXkT61Xvw3jKOZNGCjEEkev_VWuraviUaq8ZKXphXhSYZcnnWRAj1cxgrzTJ7Kj4rOcSfQO7EDXx0jn6QSz0F7mIgA9vv5sqhWAlLi9m3bANlX9OdqthN7xwtBC6VNAmWQ5W-xz4dtWsEAF6eSfBs-AF0aKchAA-YE5WWGcbQHh6b80rX1TsnFQAtAIOxkWEuWWM0GiI1Lfdh0C24yGZVEofRe7CqnfVzGBDlUqYCrt5Dxfi4ZdTazyuWo4A8CtU',
    reelLink: 'https://www.instagram.com/createwithanmol',
    promptLink: 'https://gumroad.com',
  },
  {
    id: 'hyper-real-lighting-prompts',
    title: 'Hyper-Real Lighting Prompts',
    description: 'Master studio lighting setups within AI generation for product-level realism.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaJRV-pVmT9v8HbKQdLFi7io3jL0s_NuE4u2XNJPc8_Ivly6R2Gu-bUVPqjhaPigp2loqOVkzzRUAI-ZsUrKcZGxOqQfeJFxyuJfhWBvE7lgmy288W33gMulxKbTK-dSVZtNcn9sbQPWa31g5OWk-psRaUXSapkhi80rRSKN7JcejDyQgWR3lsS9EgtDfYLt2UlH-IfXUo7hgDxEx6mE6-yhUaX27vuL0a701nRZ92Pg0Y1HTS6lGNsiNWLNnaiWqgvSFhutzwqy8',
    reelLink: 'https://www.instagram.com/createwithanmol',
    promptLink: 'https://gumroad.com',
  },
]

export const BLOGS: Blog[] = [
  {
    id: 'designing-liquid-glass-rendering-engine',
    title: 'Designing the Liquid Glass Rendering Engine',
    excerpt: 'Exploring the mathematical foundations and shader optimization techniques required to achieve real-time cinematic glassmorphism in browser-based AI generation tools, without sacrificing frame rates.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50e6AdcpqIRjFDcE9LDlbWm6Kt5Sb_q01Twjm8L5fpXsUq5-j3iRnL3a0meT6GtWmr1XEjNDNpR7b7nCJmsJO87y8c8u0j7cegMFwPAjYASBKbM2gVnrOqbiqz7iItAkDkVmtS1P7LurmCt2tVb22gqgITbeCn2G6n2RloCh1VCeTfRB5Az-9Dlvei9YV5wNg7x1e6ieHjImnOOP-pVhcdIDh-eMeQqn7l21hU3Io4kmO95o_64Kjf4BJSTKtAuXtR4ofek0s05o',
    articleLink: 'https://medium.com/@createwithanmol',
    category: 'Architecture',
    readTime: '12 min read',
    date: 'Oct 12, 2024',
    featured: true,
    order: 1,
  },
  {
    id: 'scaling-distributed-ai-workloads',
    title: 'Scaling Distributed AI Workloads',
    excerpt: 'How we manage cross-region latency when generating high-fidelity assets in real-time across distributed inference clusters.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgVnwG1VVj2KAXqUATf3_gma_3Y64NZgoMMcrBqunJPWn2G218Euam73jYeMw0mSSl9w6qNERrq5JYM4fDadgQhLbhdfmzuWcz_kbbBNP28ujd7vVvIuSUPm6ZgnDvlt3587moNrPuNvode2FOyLztiRY-xMKtqANivacLhSl398WlVilvfoSbBdGAnT335inGLcrnXY7BFWBODzWDkfrd4nuJeT50jz_9zGxzBR2__P8KK2jtL0me0ZShUwivi368S0_JMbH_LNk',
    articleLink: 'https://medium.com/@createwithanmol',
    category: 'Infrastructure',
    readTime: '9 min read',
    date: 'Sep 28, 2024',
    order: 2,
  },
  {
    id: 'type-safe-prompt-injection',
    title: 'Type-Safe Prompt Injection',
    excerpt: 'Securing user inputs while maintaining the expressive power of large language models in production AI pipelines.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIOO6SgI3QOTISUYv_p8j-jTKzlGsVPikIKbA5or-ZGXkBnyIIfnCyfT-VnaaaXSPiuBv39JzJG0G5BTT58dhuTyIEMySyX0ebiKNngJZ6VenU_QfotszMTiOXtfT46XK8h7wuoEuGfiMfZBSi-UAPwtTzMn9wLFa81cq0pnH_rNtMcKtloyU7oR7xiDfTRJ06SzWq-9a1qV8Qzq7mNZRE7qRWD7okjBJYtbr1BNAkqLH3Fo0t0TkKTFapPEESnJRM2-k-cDKCg8M',
    articleLink: 'https://medium.com/@createwithanmol',
    category: 'Engineering',
    readTime: '7 min read',
    date: 'Sep 15, 2024',
    order: 3,
  },
  {
    id: 'typography-in-the-age-of-ai',
    title: 'Typography in the Age of AI',
    excerpt: 'Why monospaced technical fonts are replacing sans-serifs in modern creative interfaces and what this means for AI-first design systems.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS21_1fTiRTvSHnWj0zBunOie1bcxUC7hwO07OT4e4yjSSFrBhUTdQ06Y0GC-jI8cKulUjG8wjytpxK6g_PIJ6vf3FSF3RU6Y4KMLmobqI2nqqiClIT9uwQd1q6XwyA_P43j90p-3-7PBM2Uda2Bt36KVkctkHyNCwc4RdJZZCPoymY4lKiYP-f5Le1AuwMKAdNyh8K6ZRWRO1P73PM7AIEm90VvoaJqbJZR90ULMxxVbliRQB68ZJH50ugQoef_VjvgJh6WMRIxY',
    articleLink: 'https://medium.com/@createwithanmol',
    category: 'Design',
    readTime: '6 min read',
    date: 'Aug 30, 2024',
    order: 4,
  },
  {
    id: 'workflow-automation-for-ai-creators',
    title: 'Workflow Automation for AI Creators',
    excerpt: 'Structured prompt sequences and automation chains for building repeatable creative pipelines with consistent, high-quality AI output.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaJRV-pVmT9v8HbKQdLFi7io3jL0s_NuE4u2XNJPc8_Ivly6R2Gu-bUVPqjhaPigp2loqOVkzzRUAI-ZsUrKcZGxOqQfeJFxyuJfhWBvE7lgmy288W33gMulxKbTK-dSVZtNcn9sbQPWa31g5OWk-psRaUXSapkhi80rRSKN7JcejDyQgWR3lsS9EgtDfYLt2UlH-IfXUo7hgDxEx6mE6-yhUaX27vuL0a701nRZ92Pg0Y1HTS6lGNsiNWLNnaiWqgvSFhutzwqy8',
    articleLink: 'https://medium.com/@createwithanmol',
    category: 'Workflow',
    readTime: '8 min read',
    date: 'Aug 12, 2024',
    order: 5,
  },
  {
    id: 'editorial-philosophy-of-cinematic-ai',
    title: 'The Editorial Philosophy of Cinematic AI',
    excerpt: 'How restraint, negative space, and editorial precision define the next generation of AI-native creative tools and what we can learn from film.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOTX8fdE07Xs2xlJrYy8xLXUAE447yLcBV0-Kcylqe9gVAq7Msy9URzj3UH8Lvu7zF3QLE7goW7ze-fYYumrn5xgp_kiVxRy0rSkC5Z7GdtmfKD4ZNrb93d9VzjW6LAh76ckapMjTzCqOCxzw_h9huR0C-DDnIixz2hsv_ImRCs9wEosJC7Hqlsflh8aUIcFLx_dZZUazDjirEgnoZiqqOjD8Y5p5UUGdL4bxEoY1CrYmu_E0qgcuRcVi_hYfwaHT2_hYPyBuIJ6w',
    articleLink: 'https://medium.com/@createwithanmol',
    category: 'Philosophy',
    readTime: '10 min read',
    date: 'Jul 28, 2024',
    order: 6,
  },
]

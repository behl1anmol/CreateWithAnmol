import { SiGithub, SiMedium, SiInstagram, SiX, SiGumroad } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa6'
import type { IconType } from 'react-icons'

export interface SocialPlatform {
  key: string
  label: string
  href: string
  brandColor: string
  Icon: IconType
  description: string
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    key: 'linkedin',
    label: 'LINKEDIN',
    href: 'https://www.linkedin.com/in/behlanmol/',
    brandColor: '#0A66C2',
    Icon: FaLinkedin,
    description: 'Professional posts on AI, design systems, and building creative tools at scale.',
  },
  {
    key: 'github',
    label: 'GITHUB',
    href: 'https://github.com/behl1anmol',
    brandColor: '#FFFFFF',
    Icon: SiGithub,
    description: 'Open source projects, prompt engineering tools, and code experiments. The engineering side of the work.',
  },
  {
    key: 'medium',
    label: 'MEDIUM',
    href: 'https://medium.com/@behl1anmol',
    brandColor: '#FFFFFF',
    Icon: SiMedium,
    description: 'In-depth technical articles on AI, design systems, and editorial workflows. Published regularly for builders who think deeply.',
  },
  {
    key: 'gumroad',
    label: 'GUMROAD',
    href: 'https://behlanmol.gumroad.com/',
    brandColor: '#FF90E8',
    Icon: SiGumroad,
    description: 'Premium digital products: preset packs, UI kits, guides, and prompt libraries engineered for professional creative output.',
  },
  {
    key: 'instagram',
    label: 'INSTAGRAM',
    href: 'https://www.instagram.com/thestudioprompts.ai/',
    brandColor: '#E1306C',
    Icon: SiInstagram,
    description: 'Reels, prompt breakdowns, and cinematic AI visuals. The primary channel for new work and process documentation.',
  },
  {
    key: 'x',
    label: 'X',
    href: 'https://x.com/behl1anmol',
    brandColor: '#FFFFFF',
    Icon: SiX,
    description: 'Real-time thoughts on AI, creativity, and the future of digital craftsmanship.',
  },
]

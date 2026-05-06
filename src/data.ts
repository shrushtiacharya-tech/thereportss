import { Article } from './types';

export const ARTICLES: Article[] = [
  {
    id: '1',
    category: 'National',
    title: 'Global Leaders Convene for Emergency Climate Summit as Arctic Ice Hits Record Low',
    summary: 'Heads of state and environmental authorities converged in Geneva today for an urgent climate summit, following newly released scientific data confirming that Arctic sea ice has reached an unprecedented historic low. The gathering underscores a growing global consensus on the accelerating pace of the climate crisis. Delegations are reportedly negotiating stringent new carbon emission mandates intended to limit global warming to 1.5 degrees Celsius. While several developing nations expressed concern regarding the economic impact of rapid industrial transition, the majority of the G20 leaders have signaled a commitment to long-term sustainability goals, prioritizing ecological preservation over immediate fiscal yields.',
    author: 'The Reports Team',
    publishedAt: 'May 3, 2026',
    isHero: true
  },
  {
    id: '2',
    category: 'Business',
    title: 'Central Bank Signals Interest Rate Stability Amid Easing Inflationary Pressures',
    summary: 'The Federal Reserve announced today its decision to maintain current interest rates, citing a sustained cooling of consumer price indices and broader market stabilization. This strategic pause follows eighteen months of aggressive fiscal tightening intended to curb post-pandemic inflation. Analysts suggest that the stability in borrowing costs will provide a much-needed reprieve for the housing sector and corporate capital expenditures. While the central bank remains vigilant regarding potential energy price volatility, the overall economic outlook has shifted toward a "soft landing," with labor markets showing resilient growth despite the previous cycle of rate hikes.',
    author: 'The Reports Team',
    publishedAt: 'May 3, 2026',
  },
  {
    id: '3',
    category: 'Technology',
    title: 'Quantum Computing Breakthrough: Researchers Achieve Stable Qubit Interconnectivity',
    summary: 'A consortium of physicists and computer scientists has reported a major milestone in quantum information science, successfully demonstrating stable, error-corrected interconnectivity between superconducting qubits. This breakthrough addresses the primary challenge of "quantum decoherence," where fragile quantum states collapse due to environmental interference. By utilizing a novel cryogenic isolation technique, the researchers were able to maintain structural integrity across a 50-qubit processor for extended durations. This advancement significantly accelerates the timeline for developing commercially viable quantum computers capable of solving complex cryptographic and pharmacological problems currently beyond the reach of classical supercomputing.',
    author: 'The Reports Team',
    publishedAt: 'May 2, 2026',
  },
  {
    id: '4',
    category: 'International',
    title: 'Infrastructure Rehabilitation Commences in Sub-Saharan Regions Following Historic Floods',
    summary: 'Large-scale reconstruction efforts have officially launched across several Sub-Saharan nations following a season of unprecedented rainfall that displaced millions and decimated critical infrastructure. International aid consortiums, in collaboration with local governments, are prioritizing the restoration of transportation networks and power grids. The African Union has called for a coordinated multi-national response to address the humanitarian crisis, focusing on sanitation and long-term food security. Structural engineers are being deployed to design climate-resilient bridges and drainage systems to mitigate the impact of future extreme weather events, which are becoming increasingly frequent in the region.',
    author: 'The Reports Team',
    publishedAt: 'May 2, 2026',
  },
  {
    id: '5',
    category: 'Opinion',
    title: 'The Paradox of Progress: Evaluating the Impact of Digital Saturation on Mental Health',
    summary: 'As digital connectivity reaches an all-time zenith, a growing body of psychological research suggests a profound disconnect in social cohesion among the youth. The ubiquity of algorithmic social feeds has created a "performance-based" existence, often leading to heightened levels of anxiety and perceived isolation. This editorial argues for a radical reassessment of our digital habits, advocating for "analog intervals" and more robust privacy regulations. While the benefits of global information access are undeniable, the cost to human intimacy and community focus remains a critical challenge for the next decade of technological evolution.',
    author: 'The Reports Team',
    publishedAt: 'May 1, 2026',
    isTrending: true
  },
  {
    id: '6',
    category: 'Entertainment',
    title: 'Modernism Rediscovered: National Gallery Unveils Largest Mid-Century Retrospective',
    summary: 'The National Gallery of Art has opened its doors to a landmark exhibition titled "Modernism Rediscovered," featuring over 500 significant works of furniture, industrial design, and architectural theory from the mid-20th century. The retrospective explores the movement\'s enduring influence on contemporary aesthetics, highlighting a period where functionalism and artistic expression achieved a unique synthesis. Curators spent over five years securing rare prototypes from international private collections. The exhibition serves as a definitive study of the era\'s optimism and its commitment to democratizing high-quality design for the post-war domestic sphere.',
    author: 'The Reports Team',
    publishedAt: 'May 1, 2026',
  },
  {
    id: '7',
    category: 'Sports',
    title: 'Emerging Talent Dominates Continental Athletics Championship in Record-Breaking Week',
    summary: 'The Continental Athletics Championship concluded today with several historic upsets, as a new generation of sprinters and distance runners dominated the podium. Industry veterans were outpaced by younger competitors who benefited from advanced biometric training and innovative aerodynamics. Particular attention was paid to the women\'s 100-meter final, where the previous standing record was shattered by a significant margin. Sports analysts are calling this the "Great Transition," noting that the infusion of youth and data-driven methodologies is poised to redefine international competition standards ahead of the upcoming Olympic cycle.',
    author: 'The Reports Team',
    publishedAt: 'May 3, 2026',
    isTrending: true
  },
  {
    id: '8',
    category: 'International',
    title: 'Diplomatic Breakthrough as Neighboring States Resume Peace Negotiations',
    summary: 'In a significant shift toward regional stability, high-level diplomatic representatives have resumed formal peace talks following a year-long military standoff at the disputed border regions. The mediation, facilitated by a neutral international coalition, has already resulted in a mutual agreement to de-escalate military presence and reopen critical trade corridors. The dialogue is focused on establishing a permanent maritime boundary and shared resource management in the mineral-rich border zone. While significant hurdles remain, particularly regarding territorial sovereignty, both administrations have expressed a renewed commitment to a peaceful resolution and economic cooperation.',
    author: 'The Reports Team',
    publishedAt: 'May 3, 2026',
  },
  {
    id: '9',
    category: 'Business',
    title: 'The Transformation of Urban Centers: Assessing the Long-Term Impact of Remote Work',
    summary: 'The global shift toward hybrid and remote work models continues to fundamentally restructure the commercial real estate landscape and the economic vitality of major metropolitan centers. As corporate tenants reduce their physical footprints, urban planners are grappling with the rising vacancy rates in traditional central business districts. This structural shift has prompted a move toward "mixed-use" development, with several cities pioneering the conversion of underutilized office towers into residential and community spaces. The decentralization of the workforce is redistributing economic capital to suburban and secondary markets, creating a complex new paradigm for municipal tax bases and public transit funding.',
    author: 'The Reports Team',
    publishedAt: 'May 2, 2026',
  }
];

export const CATEGORIES = ['National', 'International', 'Business', 'Technology', 'Entertainment', 'Sports', 'Opinion'];

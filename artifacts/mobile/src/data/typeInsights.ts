// Reference notes shown across the app: what each personality type is good at,
// where it can grow, careers that suit it, and who it tends to click with.

export interface TypeInsight {
  strength: string;
  growth: string;
  career: string;
  love: string;
}

export const TYPE_INSIGHTS: Record<string, TypeInsight> = {
  INTJ: { strength: "Strategic vision & systems thinking", growth: "Open up to emotional vulnerability", career: "Architecture, Engineering, Strategy, Science", love: "Seek depth over surface. ENFP & ENTP balance you perfectly." },
  INTP: { strength: "Analytical depth & original ideas", growth: "Act on ideas, not just analyze them", career: "Research, Programming, Philosophy, Academia", love: "You need intellectual stimulation first. ENTJ & ENFJ challenge you." },
  ENTJ: { strength: "Leadership & decisive execution", growth: "Practice empathy & listening", career: "CEO, Management, Law, Entrepreneurship", love: "Your ideal partner matches your ambition. INTP & INFP balance you." },
  ENTP: { strength: "Creative problem-solving & debate", growth: "Follow through on projects to the end", career: "Startups, Law, Consulting, Innovation", love: "INFJ understands your depth. INTJ matches your intensity." },
  INFJ: { strength: "Deep empathy & visionary thinking", growth: "Set boundaries & avoid burnout", career: "Psychology, Writing, Teaching, Counseling", love: "You're selective. ENTP & ENFP bring out your lighter side." },
  INFP: { strength: "Authentic creativity & deep values", growth: "Take action despite perfectionism", career: "Writing, Art, Psychology, Social Work", love: "ENFJ protects you. INFJ understands your inner world." },
  ENFJ: { strength: "Inspiring leadership & human insight", growth: "Prioritize your own needs too", career: "Teaching, HR, Leadership, Coaching", love: "INFP & INFJ are your soulmates. You grow with INTJ." },
  ENFP: { strength: "Boundless enthusiasm & emotional intelligence", growth: "Commit and finish what you start", career: "Marketing, Coaching, Acting, Entrepreneurship", love: "INTJ is your classic match. INFJ deeply understands you." },
  ISTJ: { strength: "Reliability, discipline & attention to detail", growth: "Embrace change and spontaneity", career: "Accounting, Law, Military, Administration", love: "ESFP & ESTP balance your seriousness with fun." },
  ISFJ: { strength: "Warm loyalty & practical care", growth: "Express your needs without guilt", career: "Nursing, Teaching, Social Work, Admin", love: "ESTP brings excitement. ESFP keeps life joyful." },
  ESTJ: { strength: "Organization, efficiency & leadership", growth: "Listen before directing", career: "Management, Military, Finance, Law", love: "ISFP's creativity softens you. INTP challenges you." },
  ESFJ: { strength: "Warmth, social harmony & care", growth: "Trust your own judgment more", career: "Healthcare, Education, HR, Events", love: "ISTP's calm complements your warmth." },
  ISTP: { strength: "Cool-headed problem solving & skill mastery", growth: "Communicate feelings proactively", career: "Engineering, Mechanics, Tech, Athletics", love: "ESFJ's warmth draws you out. ESTJ shares your practicality." },
  ISFP: { strength: "Artistic sensitivity & present-moment living", growth: "Build confidence in your vision", career: "Art, Music, Design, Nature, Healthcare", love: "ENTJ's direction guides you. ESFP shares your joy." },
  ESTP: { strength: "Bold action, charm & risk management", growth: "Think before acting in emotional situations", career: "Sales, Emergency Services, Sports, Entrepreneurship", love: "ISFJ's depth grounds you. ISTP's calm balances you." },
  ESFP: { strength: "Infectious energy, fun & generosity", growth: "Build financial & life plans", career: "Entertainment, Hospitality, Sales, Sports", love: "ISTJ's stability anchors you. ISFJ shares your warmth." },
};

// Choices for the Enneagram and Socionics pickers on the profile.
export const ENNEAGRAM_TYPES = ["1w2","1w9","2w1","2w3","3w2","3w4","4w3","4w5","5w4","5w6","6w5","6w7","7w6","7w8","8w7","8w9","9w1","9w8"];
export const SOCIONICS_TYPES = ["ILE","SEI","ESE","LII","EIE","LSI","SLE","IEI","SEE","ILI","LIE","ESI","LSE","EII","IEE","SLI"];

import type { LinkedInProfileKit } from './types.js';

export const skillOptions = ['Programming', 'Python', 'Java', 'React', 'Web Development', 'Machine Learning', 'Data Analysis', 'CAD', 'Engineering Design', 'Robotics', 'Electronics', 'Research', 'Public Speaking', 'Leadership', 'Entrepreneurship', 'Finance', 'Marketing', 'Project Management', 'Scientific Research', 'Problem Solving'] as const;
export type LaunchSkill = typeof skillOptions[number];
export interface SuggestedProject {
  id: string; name: string; field: string; description: string;
  linkedInDescription: string; recommendedSkills: LaunchSkill[];
}
export interface InterestTemplate {
  id: string; label: string; headline: string; about: string; firstPost: string;
  projects: [SuggestedProject, SuggestedProject, SuggestedProject];
}
function project(id: string, name: string, field: string, description: string, linkedInDescription: string, recommendedSkills: LaunchSkill[]): SuggestedProject {
  return { id, name, field, description, linkedInDescription, recommendedSkills };
}
// All writing lives here. Placeholders insert only the student's local selections.
export const interestTemplates: InterestTemplate[] = [
  {
    id: 'software', label: 'Software Development',
    headline: 'Student Developer | Building Useful Technology | Interested in Software & Problem Solving',
    about: "I'm a student interested in software development and creating useful, approachable technology.\n\nI'm planning to explore these interests through {project}, an idea focused on {field}. I want to learn how thoughtful code and clear design can make everyday tasks easier.\n\nI'm developing skills in {skills} and looking for opportunities to learn with others, test ideas, and build practical software step by step.",
    firstPost: "I'm excited to share my interest in software development and useful technology.\n\nOne project idea I plan to explore is {project}. {description}\n\nI'm looking forward to improving my skills in {skills}, getting feedback, and sharing what I learn along the way.",
    projects: [
      project('software-planner', 'Student Study Planner', 'Software Development · Student Productivity', 'Build a web app for assignments, deadlines, and study plans.', 'Planning a web application that helps students organize assignments and deadlines. The idea explores clear interfaces, useful reminders, and a manageable approach to everyday study planning.', ['Programming', 'React', 'Web Development']),
      project('software-map', 'Community Resource Map', 'Software Development · Community Resources', 'Map useful local resources in an easy-to-use website.', 'Exploring a website that maps community resources and helps students find useful local services. The concept focuses on accessible information, practical search tools, and thoughtful web design.', ['Web Development', 'Programming', 'Problem Solving']),
      project('software-clubs', 'School Club Management Platform', 'Software Development · Student Organizations', 'Help clubs organize events, members, and announcements.', 'Planning a tool for school clubs to manage events, member information, and announcements. The idea combines simple organization features with a student-friendly interface.', ['Programming', 'React', 'Project Management']),
    ],
  },
  {
    id: 'engineering', label: 'Engineering',
    headline: 'Student Engineer | Interested in Sustainable Design & Technology | Building Solutions to Real-World Problems',
    about: "I'm a student interested in engineering, sustainable design, and solving practical problems through hands-on ideas.\n\nI'm planning to explore {project}, a project idea in {field}. I want to understand how careful design, testing, and iteration could turn a practical challenge into a useful solution.\n\nI'm developing skills in {skills} while looking for opportunities to learn from others and take my ideas from a sketch toward a thoughtful prototype.",
    firstPost: "I'm excited to start sharing the engineering and technology ideas I'm exploring.\n\nOne project I plan to develop is {project}. {description}\n\nI'm looking forward to learning more about design and testing, strengthening my skills in {skills}, and sharing what I discover.",
    projects: [
      project('engineering-irrigation', 'Smart Irrigation System', 'Engineering · Environmental Technology', 'Design a sensor-based system to monitor soil and improve water use.', 'Exploring the design of a sensor-based irrigation system that could monitor soil conditions and improve water efficiency. The idea combines engineering design, sustainability, and technology to address a practical environmental challenge.', ['Programming', 'Engineering Design', 'Problem Solving']),
      project('engineering-water', 'Low-Cost Water Filtration Prototype', 'Engineering · Water Systems', 'Design and compare small filters using accessible materials.', 'Planning a small water filtration prototype using accessible materials. The project idea focuses on comparing designs, documenting test methods, and understanding filtration; it does not claim to produce drinking-safe water.', ['Engineering Design', 'Research', 'Problem Solving']),
      project('engineering-home', 'Energy-Efficient Model Home', 'Engineering · Sustainable Design', 'Explore insulation and energy use through a model home.', 'Exploring a model home design that compares insulation, layout, and energy use. The idea uses small-scale design experiments to investigate how engineering choices could support more efficient buildings.', ['CAD', 'Engineering Design', 'Problem Solving']),
    ],
  },
  {
    id: 'ai', label: 'Artificial Intelligence',
    headline: 'Student Exploring AI | Interested in Machine Learning & Responsible Technology | Learning Through Projects',
    about: "I'm a student interested in artificial intelligence and how learning systems can support useful, responsible technology.\n\nI'm planning to explore {project}, an idea in {field}. I want to understand how models are designed, how results are evaluated, and where their limitations matter.\n\nI'm developing skills in {skills} and hope to learn with others while testing small ideas, asking good questions, and documenting what works and what does not.",
    firstPost: "I'm starting to explore artificial intelligence through practical student project ideas.\n\nOne idea I plan to investigate is {project}. {description}\n\nI'm excited to practice {skills}, evaluate results carefully, and share what I learn about the possibilities and limitations of AI.",
    projects: [
      project('ai-study', 'Study Recommendation Assistant', 'Artificial Intelligence · Education', 'Prototype recommendations for useful study resources.', 'Planning a prototype that recommends study resources based on student interests and learning goals. The idea explores recommendation methods, useful feedback, and the limits of automated suggestions.', ['Python', 'Machine Learning', 'Problem Solving']),
      project('ai-images', 'Image Classification Explorer', 'Artificial Intelligence · Computer Vision', 'Explore image classification and compare model results.', 'Exploring a beginner-friendly image classification project using an educational dataset. The idea focuses on comparing predictions, reviewing errors, and learning how to evaluate model performance without overstating accuracy.', ['Python', 'Machine Learning', 'Data Analysis']),
      project('ai-opportunities', 'Student Opportunity Matcher', 'Artificial Intelligence · Student Opportunities', 'Design a recommendation system for student opportunities.', 'Planning a recommendation system that connects student interests and skills with relevant opportunities. The concept explores transparent matching rules, useful recommendations, and ways to collect feedback.', ['Programming', 'Machine Learning', 'Data Analysis']),
    ],
  },
  {
    id: 'business', label: 'Business & Entrepreneurship',
    headline: 'Student Exploring Entrepreneurship | Interested in Business, Innovation & Community Solutions',
    about: "I'm a student interested in business and entrepreneurship, especially how a clear idea can address a genuine need.\n\nI'm planning to explore {project}, a concept in {field}. I want to learn how to understand potential users, communicate value, and test assumptions before making big claims.\n\nI'm developing skills in {skills} while looking for opportunities to exchange ideas, ask for feedback, and turn early concepts into thoughtful plans.",
    firstPost: "I'm excited to begin sharing the business and entrepreneurship ideas I'm exploring.\n\nOne concept I plan to develop is {project}. {description}\n\nI'm looking forward to practicing {skills}, listening to feedback, and learning how to test whether an idea addresses a real need.",
    projects: [
      project('business-marketplace', 'Student Marketplace Concept', 'Business · Student Entrepreneurship', 'Plan a place for students to showcase products or services.', 'Exploring a marketplace concept where students could showcase products or services. The plan considers user needs, clear pricing, responsible operations, and ways to test interest before launching.', ['Entrepreneurship', 'Marketing', 'Project Management']),
      project('business-growth', 'Local Business Growth Plan', 'Business · Marketing Strategy', 'Create a growth strategy for a fictional or local business.', 'Planning an educational growth strategy for a fictional or local business. The idea explores customer research, messaging, and practical marketing options without claiming real sales or client results.', ['Marketing', 'Research', 'Finance']),
      project('business-impact', 'Social Impact Startup', 'Entrepreneurship · Social Impact', 'Develop a startup concept around a community problem.', 'Exploring a startup concept that addresses a community challenge. The plan focuses on understanding the problem, identifying potential users, and considering sustainable ways to deliver value.', ['Entrepreneurship', 'Leadership', 'Problem Solving']),
    ],
  },
  {
    id: 'finance', label: 'Finance',
    headline: 'Student Interested in Finance | Exploring Markets, Business & Financial Analysis',
    about: "I'm a student interested in finance, financial literacy, and understanding how people make decisions about money.\n\nI'm planning to explore {project}, an educational idea in {field}. I want to practice comparing information, explaining assumptions, and making financial concepts easier to understand.\n\nI'm developing skills in {skills} and looking for opportunities to learn, discuss ideas, and communicate findings clearly. My project interests are educational, not investment advice.",
    firstPost: "I'm starting to explore finance through student projects and educational research.\n\nOne idea I plan to work on is {project}. {description}\n\nI'm looking forward to practicing {skills} and sharing what I learn about financial decisions. This is an educational project, not investment advice.",
    projects: [
      project('finance-budget', 'Student Budget Dashboard', 'Finance · Personal Financial Literacy', 'Design a simple spending and savings-goal dashboard.', 'Planning a simple dashboard for tracking sample spending and savings goals. The idea explores clear financial summaries and approachable budgeting concepts using fictional data.', ['Finance', 'Data Analysis', 'Programming']),
      project('finance-stocks', 'Stock Market Research Project', 'Finance · Educational Market Research', 'Compare public company information for an educational report.', 'Exploring an educational comparison of several companies using public information. The project idea emphasizes explaining assumptions, discussing risks, and comparing businesses without recommending investments.', ['Finance', 'Research', 'Data Analysis']),
      project('finance-literacy', 'Financial Literacy Campaign', 'Finance · Student Education', 'Create approachable resources about everyday money concepts.', 'Planning student-friendly resources that explain budgeting, saving, and basic financial concepts. The idea focuses on clear examples, accessible language, and helping peers ask informed questions.', ['Finance', 'Public Speaking', 'Marketing']),
    ],
  },
  {
    id: 'biology', label: 'Biology & Healthcare',
    headline: 'Student Exploring Biology & Healthcare | Interested in Scientific Research & Human Wellbeing',
    about: "I'm a student interested in biology, healthcare, and the scientific questions behind human wellbeing.\n\nI'm planning to explore {project}, an educational project idea in {field}. I want to learn how to read scientific sources, design careful questions, and explain findings responsibly.\n\nI'm developing skills in {skills} while looking for opportunities to learn from others and connect biological concepts with meaningful student research.",
    firstPost: "I'm excited to share my growing interest in biology and healthcare.\n\nOne educational project I plan to explore is {project}. {description}\n\nI'm looking forward to strengthening my skills in {skills}, using reliable sources, and sharing what I learn without making medical claims.",
    projects: [
      project('biology-microbes', 'Microbiome Research Explorer', 'Biology · Microbial Research', 'Explore published research about microbes and ecosystems.', 'Planning a literature-based exploration of microbes and their roles in ecosystems. The idea involves comparing published studies and creating clear summaries; it does not involve culturing unknown organisms.', ['Scientific Research', 'Research', 'Data Analysis']),
      project('biology-health', 'Student Health Information Guide', 'Healthcare · Science Communication', 'Design a guide that explains reliable public health resources.', 'Exploring a student-friendly guide to reputable public health information. The concept focuses on evaluating sources and explaining general concepts clearly, without providing diagnoses or medical advice.', ['Research', 'Public Speaking', 'Problem Solving']),
      project('biology-cells', 'Cell Biology Learning Toolkit', 'Biology · Education', 'Create visual learning materials about cells and biological systems.', 'Planning a learning toolkit that explains cell structures and biological processes through clear visuals and activities. The idea connects scientific reading with approachable educational design.', ['Scientific Research', 'Research', 'Project Management']),
    ],
  },
  {
    id: 'chemistry', label: 'Chemistry',
    headline: 'Student Exploring Chemistry | Interested in Materials, Scientific Research & Practical Discovery',
    about: "I'm a student interested in chemistry and how the properties of substances connect to everyday materials and scientific discovery.\n\nI'm planning to explore {project}, an idea in {field}. I want to develop careful research habits, understand the limits of evidence, and explain chemical concepts clearly.\n\nI'm developing skills in {skills} while looking for opportunities to compare ideas, document observations, and learn more about the science of materials.",
    firstPost: "I'm beginning to explore chemistry through approachable research and design ideas.\n\nOne project I plan to investigate is {project}. {description}\n\nI'm excited to practice {skills}, ask better scientific questions, and share what I learn about materials and chemical properties.",
    projects: [
      project('chemistry-materials', 'Everyday Materials Comparison', 'Chemistry · Materials Science', 'Compare published properties of familiar everyday materials.', 'Planning a comparison of everyday materials using published information about their properties. The idea explores how chemical structure relates to material choices and clearly documents the sources used.', ['Scientific Research', 'Data Analysis', 'Research']),
      project('chemistry-indicators', 'Natural Indicator Research Plan', 'Chemistry · Acids and Bases', 'Design a supervised learning activity about natural pH indicators.', 'Exploring a research plan for a supervised educational activity about natural pH indicators. The concept focuses on understanding acids and bases, planning observations, and following appropriate school laboratory guidance.', ['Scientific Research', 'Research', 'Problem Solving']),
      project('chemistry-packaging', 'Sustainable Packaging Study', 'Chemistry · Sustainable Materials', 'Research the properties and tradeoffs of packaging materials.', 'Planning a literature-based comparison of packaging materials and their chemical properties. The idea considers durability, environmental tradeoffs, and the evidence behind sustainability claims.', ['Research', 'Scientific Research', 'Data Analysis']),
    ],
  },
  {
    id: 'environment', label: 'Environmental Science',
    headline: 'Student Exploring Environmental Science | Interested in Sustainability, Research & Community Solutions',
    about: "I'm a student interested in environmental science and how thoughtful research can support more sustainable communities.\n\nI'm planning to explore {project}, an idea in {field}. I want to understand environmental patterns, compare evidence, and consider practical ways to use resources more carefully.\n\nI'm developing skills in {skills} and looking for opportunities to learn with others, communicate findings, and connect scientific questions with local challenges.",
    firstPost: "I'm excited to share the environmental science and sustainability ideas I'm exploring.\n\nOne project I plan to develop is {project}. {description}\n\nI'm looking forward to practicing {skills}, documenting evidence, and sharing what I learn about our environment.",
    projects: [
      project('environment-air', 'Neighborhood Air Quality Explorer', 'Environmental Science · Air Quality', 'Explore patterns in publicly available air quality data.', 'Planning an exploration of public air quality data to understand patterns across locations and time. The idea focuses on careful comparisons, clear visualizations, and explaining the limits of the available measurements.', ['Data Analysis', 'Research', 'Scientific Research']),
      project('environment-waste', 'School Waste Reduction Plan', 'Environmental Science · Resource Use', 'Design a school waste audit and reduction proposal.', 'Exploring a school waste reduction plan through a proposed audit and practical improvement ideas. The concept focuses on measuring a starting point and comparing options rather than claiming reductions already achieved.', ['Research', 'Project Management', 'Leadership']),
      project('environment-biodiversity', 'Community Biodiversity Map', 'Environmental Science · Ecology', 'Plan a map of local plants and public biodiversity observations.', 'Planning a community biodiversity map based on public observations and responsibly collected information. The idea explores ecological patterns, clear mapping, and ways to protect sensitive location information.', ['Scientific Research', 'Data Analysis', 'Web Development']),
    ],
  },
  {
    id: 'data', label: 'Data Science',
    headline: 'Student Exploring Data Science | Interested in Analysis, Visualization & Evidence-Based Questions',
    about: "I'm a student interested in data science and turning useful questions into clear, well-supported insights.\n\nI'm planning to explore {project}, an idea in {field}. I want to practice organizing data, looking for patterns, and explaining uncertainty rather than drawing conclusions too quickly.\n\nI'm developing skills in {skills} while looking for opportunities to learn with others and make data understandable through thoughtful analysis and visualization.",
    firstPost: "I'm starting to explore data science through practical student project ideas.\n\nOne project I plan to investigate is {project}. {description}\n\nI'm looking forward to practicing {skills}, checking assumptions, and sharing clear visualizations and what they can teach us.",
    projects: [
      project('data-transit', 'Public Transit Data Dashboard', 'Data Science · Public Transportation', 'Explore open transit data through an educational dashboard.', 'Planning an educational dashboard using public transit data. The idea examines patterns in routes or schedules and focuses on readable visualizations and transparent data sources.', ['Python', 'Data Analysis', 'Programming']),
      project('data-sports', 'Sports Statistics Explorer', 'Data Science · Statistics', 'Compare public sports statistics and explain patterns.', 'Exploring public sports statistics through simple comparisons and charts. The concept emphasizes explaining the data, separating correlation from causation, and checking whether patterns are meaningful.', ['Data Analysis', 'Python', 'Problem Solving']),
      project('data-survey', 'Student Survey Analysis Plan', 'Data Science · Student Research', 'Plan an anonymous survey and summarize sample responses.', 'Planning an anonymous student survey and an analysis of fictional or appropriately collected responses. The idea focuses on clear questions, privacy, and honest summaries of the limits of a small sample.', ['Data Analysis', 'Research', 'Scientific Research']),
    ],
  },
  {
    id: 'robotics', label: 'Robotics',
    headline: 'Student Exploring Robotics | Interested in Design, Electronics & Intelligent Systems',
    about: "I'm a student interested in robotics and how design, electronics, and programming work together to make useful systems.\n\nI'm planning to explore {project}, an idea in {field}. I want to understand how small design choices affect sensing, movement, and control, and learn through careful iteration.\n\nI'm developing skills in {skills} while looking for opportunities to collaborate, test simple prototypes, and document the lessons behind each design.",
    firstPost: "I'm excited to start sharing the robotics ideas I'm exploring.\n\nOne project I plan to develop is {project}. {description}\n\nI'm looking forward to practicing {skills}, learning through small tests, and sharing how the design evolves.",
    projects: [
      project('robotics-line', 'Line-Following Robot', 'Robotics · Sensing and Control', 'Plan a small robot that follows a marked path.', 'Exploring the design of a small line-following robot using sensors and basic control logic. The idea connects electronics, programming, and mechanical design through a manageable prototype plan.', ['Robotics', 'Electronics', 'Programming']),
      project('robotics-gripper', 'Simple Robotic Gripper', 'Robotics · Mechanical Design', 'Design a gripper for handling lightweight objects.', 'Planning a simple robotic gripper for lightweight objects. The concept explores mechanism design, material choices, and basic control while considering safe, small-scale testing.', ['CAD', 'Engineering Design', 'Robotics']),
      project('robotics-obstacles', 'Obstacle Detection Rover', 'Robotics · Mobile Systems', 'Explore how a rover could sense and avoid nearby obstacles.', 'Exploring a small rover concept that detects nearby obstacles and adjusts its movement. The plan focuses on sensor readings, simple decision rules, and documenting limitations during controlled tests.', ['Robotics', 'Electronics', 'Programming']),
    ],
  },
];
export function buildLocalProfileKit(interestId: string, selectedSkills: readonly string[], projectId: string): LinkedInProfileKit {
  const interest = interestTemplates.find(item => item.id === interestId);
  const chosen = interest?.projects.find(item => item.id === projectId);
  const skills = skillOptions.filter(skill => selectedSkills.includes(skill));
  if (!interest || !chosen || !skills.length) throw new Error('Select an interest, at least one skill, and a project from that interest.');
  const values: Record<string, string> = { project: chosen.name, field: chosen.field, skills: skills.join(', '), description: chosen.linkedInDescription };
  const fill = (template: string) => template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
  return {
    headline: interest.headline, about: fill(interest.about),
    projects: [{ title: chosen.name, organization: chosen.field, description: chosen.linkedInDescription, skills: [...skills] }],
    skills: [...skills], suggestedPost: fill(interest.firstPost),
    experience: [], honors: [], volunteering: [], mentorship: [],
  };
}

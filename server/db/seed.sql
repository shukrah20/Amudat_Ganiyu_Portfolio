INSERT INTO profile (full_name, headline, bio, location, email, linkedin_url, github_url)
VALUES (
  'Jane Doe',
  'Data Analyst | Power BI | SQL',
  'I turn messy data into clear stories. Currently building my skills in Power BI, SQL and Python.',
  'Lagos, Nigeria',
  'jane@example.com',
  'https://linkedin.com/in/example',
  'https://github.com/example'
);

INSERT INTO skills (name, category, sort_order) VALUES
  ('Power BI', 'BI Tools', 1),
  ('Power Query', 'BI Tools', 2),
  ('DAX', 'BI Tools', 3),
  ('PostgreSQL', 'Databases', 1),
  ('SQL', 'Databases', 2),
  ('Python', 'Languages', 1),
  ('Excel', 'Tools', 1);

INSERT INTO projects (slug, title, summary, tools, body_md, status, sort_order) VALUES
  (
    'sales-dashboard',
    'Retail Sales Dashboard',
    'Interactive Power BI dashboard tracking revenue, margins and top products.',
    ARRAY['Power BI', 'DAX', 'SQL'],
    E'## Problem\nThe business had no single view of sales performance.\n\n## Approach\nCleaned the data in Power Query and modelled it as a star schema.\n\n## Findings\nThree product lines drove 70% of revenue.',
    'published',
    1
  ),
  (
    'customer-churn-sql',
    'Customer Churn Analysis',
    'SQL analysis identifying which customer segments were leaving and why.',
    ARRAY['PostgreSQL', 'SQL'],
    E'## Problem\nChurn was rising with no clear cause.\n\n## Approach\nSegmented customers by tenure and plan using window functions.\n\n## Findings\nMost churn happened in the first 90 days.',
    'published',
    2
  ),
  (
    'draft-example',
    'Work in Progress',
    'This one is a draft and must NOT show on the public site.',
    ARRAY['Python'],
    'Draft content',
    'draft',
    3
  );

INSERT INTO project_media (project_id, kind, content, caption, sort_order)
SELECT id, 'sql',
  E'SELECT plan, COUNT(*) AS churned\nFROM customers\nWHERE churned_at IS NOT NULL\nGROUP BY plan\nORDER BY churned DESC;',
  'Churn by plan', 1
FROM projects WHERE slug = 'customer-churn-sql';
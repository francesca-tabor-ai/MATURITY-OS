-- Module 3.1: Industry Benchmark Engine – reporting queries

-- 1. Retrieve industry benchmarks for a given industry and maturity type
-- SELECT industry_name, maturity_type, average_score, score_distribution
-- FROM industry_benchmarks
-- WHERE industry_name = $1 AND maturity_type = $2;

-- 2. All benchmarks for an industry (Data + AI)
-- SELECT maturity_type, average_score, score_distribution
-- FROM industry_benchmarks
-- WHERE industry_name = $1
-- ORDER BY maturity_type;

-- 3. Organisation's historical benchmark comparisons
-- SELECT id, industry_used, data_maturity_score, ai_maturity_score,
--        industry_data_avg, industry_ai_avg, data_comparison, ai_comparison,
--        data_pct_diff, ai_pct_diff, created_at
-- FROM organisation_benchmarks
-- WHERE organisation_id = $1
-- ORDER BY created_at DESC
-- LIMIT 20;

-- 4. Organisations that consistently outperform (above average on both Data and AI in latest run)
-- WITH latest AS (
--   SELECT DISTINCT ON (organisation_id) organisation_id, data_comparison, ai_comparison
--   FROM organisation_benchmarks
--   ORDER BY organisation_id, created_at DESC
-- )
-- SELECT l.organisation_id, o.name, l.data_comparison, l.ai_comparison
-- FROM latest l
-- JOIN organisations o ON o.id = l.organisation_id
-- WHERE l.data_comparison = 'Above average' AND l.ai_comparison = 'Above average';

-- 5. Industries with highest average maturity (from benchmark table)
-- SELECT industry_name,
--        MAX(CASE WHEN maturity_type = 'Data' THEN average_score END) AS data_avg,
--        MAX(CASE WHEN maturity_type = 'AI' THEN average_score END) AS ai_avg
-- FROM industry_benchmarks
-- GROUP BY industry_name
-- ORDER BY (MAX(CASE WHEN maturity_type = 'Data' THEN average_score END) + MAX(CASE WHEN maturity_type = 'AI' THEN average_score END)) DESC;

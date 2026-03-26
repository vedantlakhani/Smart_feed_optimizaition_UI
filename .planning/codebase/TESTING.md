# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Runner:**
- pytest (version unspecified in `pyproject.toml`; requires `axnano-smartfeed` conda env)
- Config: `pyproject.toml` at project root

**Assertion Library:**
- pytest built-in assertions (`assert`)
- `math` standard library used for `math.isnan` / float operations (imported in test file)

**Run Commands:**
```bash
# Activate environment first
~/miniconda3/bin/conda activate axnano-smartfeed

# Run all tests
python -m pytest tests/ -v

# Run a single test
python -m pytest tests/test_core.py::TestBlendLinear::test_equal_ratios -v

# Run a specific class
python -m pytest tests/test_core.py::TestSearch -v
```

## Test File Organization

**Location:**
- All tests co-located in `tests/` directory at project root (separate from source)

**Naming:**
- Test file: `tests/test_core.py` — one file covering all core algorithm modules
- Test classes named `Test[ModuleName]` or `Test[FunctionName]`: `TestBlendLinear`, `TestBlendPH`, `TestCalcBlendProperties`, `TestCalcRWater`, `TestCalcRDiesel`, `TestCalcRNaoh`, `TestEvaluatePhase`, `TestSearch`
- Test methods named `test_[scenario]` in snake_case: `test_equal_ratios`, `test_acid_dominates`, `test_no_diesel_needed`, `test_feasible`

**Structure:**
```
tests/
├── conftest.py    # sys.path setup + shared fixtures
└── test_core.py   # 23 tests across 8 test classes
```

## Test Structure

**Suite Organization:**
```python
# Fixtures defined at module level in conftest.py or test file
@pytest.fixture
def cfg():
    return SystemConfig()

@pytest.fixture
def resin():
    return WasteStream(
        stream_id="Resin", quantity_L=200, btu_per_lb=12500,
        pH=3.0, f_ppm=15000, solid_pct=100.0, salt_ppm=500, moisture_pct=0,
    )

# Test classes group related tests
class TestCalcRWater:
    def test_no_dilution_needed(self, cfg):
        blend = BlendProperties(btu_per_lb=2000, pH=7, f_ppm=100,
                                solid_pct=10, salt_ppm=3000)
        assert calc_r_water(blend, cfg) == 0.0

    def test_solid_driven(self, cfg):
        # solid 30%, max 15% → r = 30/15 - 1 = 1.0
        blend = BlendProperties(btu_per_lb=2000, pH=7, f_ppm=0,
                                solid_pct=30, salt_ppm=0)
        assert abs(calc_r_water(blend, cfg) - 1.0) < 1e-9
```

**Patterns:**
- No `setUp`/`tearDown`; pytest fixtures used for all shared state
- Comments in test body show the expected math: `# solid 30%, max 15% → r = 30/15 - 1 = 1.0`
- Tests are stateless; no shared mutable state between tests
- No `pytest.mark` decorators (no parametrize, no skip, no xfail)

## Mocking

**Framework:**
- No mocking used; zero mock/patch imports detected
- All tests exercise real implementations end-to-end (unit tests with actual algorithm calls)

**What NOT to Mock:**
- Calculation functions (they are pure and have no side effects)
- `SystemConfig` (constructed fresh via fixture for each test)
- `WasteStream` / `BlendProperties` (instantiated inline in test body)

## Fixtures and Factories

**Shared Fixtures (defined in `tests/test_core.py`, not `conftest.py`):**
```python
@pytest.fixture
def cfg():
    return SystemConfig()       # default config, all defaults

@pytest.fixture
def resin():
    return WasteStream(
        stream_id="Resin", quantity_L=200, btu_per_lb=12500,
        pH=3.0, f_ppm=15000, solid_pct=100.0, salt_ppm=500, moisture_pct=0,
    )

@pytest.fixture
def afff():
    return WasteStream(
        stream_id="AFFF", quantity_L=500, btu_per_lb=1,
        pH=7.5, f_ppm=5000, solid_pct=0.5, salt_ppm=200, moisture_pct=99.5,
    )

@pytest.fixture
def caustic():
    return WasteStream(
        stream_id="Caustic", quantity_L=300, btu_per_lb=0,
        pH=13.5, f_ppm=0, solid_pct=0.0, salt_ppm=8000, moisture_pct=65,
    )
```

**Inline test data:**
- One-off `WasteStream` objects created inline when they are only needed for a single test
- `BlendProperties` objects always constructed inline (not shared); they are intermediate results

**Location:**
- `tests/conftest.py` contains only sys.path setup, not fixtures
- Fixtures live in `tests/test_core.py` alongside the tests that use them

## Coverage

**Requirements:** None enforced (no coverage config in `pyproject.toml`)

**View Coverage:**
```bash
python -m pytest tests/ -v --cov=smart_feed_v9 --cov-report=term-missing
```

## Test Types

**Unit Tests:**
- All 23 tests are unit tests
- Test scope: individual calculation functions and the recursive search engine
- Each test exercises a single function with carefully chosen inputs that isolate one behavior

**Integration Tests:**
- `TestSearch` serves as lightweight integration tests: exercises `search()` which internally calls `blending`, `gatekeeper`, `ratios`, and the recursive engine together
- `test_optimized_beats_solo` validates end-to-end optimization quality (blended cost < sum of solo costs)
- `test_three_streams` validates the full 3-stream search completes without error

**E2E Tests:**
- Not present; no browser/HTTP testing for the Next.js dashboard

## Common Patterns

**Floating-Point Comparison:**
```python
# Exact equality only when result must be exactly 0.0 or a clean integer
assert calc_r_water(blend, cfg) == 0.0

# Tolerance comparison for computed floats (tolerance 1e-9 for math precision)
assert abs(calc_r_water(blend, cfg) - 1.0) < 1e-9

# Looser tolerance for pH (which involves log10)
assert abs(result - 7.0) < 0.01
assert abs(result - 4.5) < 0.01
```

**None Return Testing:**
```python
# Infeasible phase returns None — assert None directly
result = evaluate_phase([alkaline], (1,), inv, cfg)
assert result is None

# Feasible phase is not None — then check properties
result = evaluate_phase([afff], (1,), inv, cfg)
assert result is not None
assert result.W >= cfg.W_min
```

**Comparison Testing (algorithm quality):**
```python
# Demonstrate blending produces lower cost than solo streams
cost_mix, _, _ = search([resin, afff], cfg)
cost_resin, _, _ = search([resin], cfg)
cost_afff, _, _ = search([afff], cfg)
assert cost_mix < cost_resin + cost_afff
```

**Stats Dict Assertion:**
```python
# Check search stats dict keys exist with valid values
cost, phases, stats = search([afff], cfg)
assert cost < float("inf")
assert len(phases) == 1
assert stats["evaluated"] > 0
assert stats["pruned_bound"] >= 0
```

**Inventory dict pattern for evaluate_phase:**
```python
# inventory passed as {stream_id: quantity_L} dict
inv = {"AFFF": 500}
result = evaluate_phase([afff], (1,), inv, cfg)
```

---

*Testing analysis: 2026-03-26*

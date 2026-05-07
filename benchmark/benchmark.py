#!/usr/bin/env python3
"""
Homer 벤치마크 - rtk 비교 측정

각 시나리오에서 압축률 측정:
1. git log (50개 커밋)
2. npm test 출력 (200개 테스트)
3. JSON API 응답
4. 애플리케이션 로그
5. ls -la 출력
"""

import sys
import os
import time

# Windows UTF-8 강제 설정
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from homer import compress


def estimate_tokens(text: str) -> int:
    """토큰 개수 대략 추정 (영어 1 단어 = 1.3 토큰, 한글 1글자 = 1 토큰)"""
    if not text:
        return 0
    words = text.split()
    return int(len(words) * 1.3)


def run_benchmark(name: str, text: str, format_hint: str = None):
    """벤치마크 실행"""
    start = time.time()
    compressed, stats = compress(text, format_hint=format_hint)
    elapsed = (time.time() - start) * 1000  # ms

    original_tokens = estimate_tokens(text)
    compressed_tokens = estimate_tokens(compressed)
    saved_pct = 100 * (1 - compressed_tokens / max(original_tokens, 1))

    print(f"\n{'='*60}")
    print(f"📊 {name}")
    print(f"{'='*60}")
    print(f"포맷:        {stats['format']}")
    print(f"원본:        {len(text):,} chars / {original_tokens} tokens")
    print(f"압축:        {len(compressed):,} chars / {compressed_tokens} tokens")
    print(f"절감률:      {saved_pct:.1f}%")
    print(f"처리 시간:   {elapsed:.2f} ms")
    print(f"\n압축 결과 미리보기:")
    print("-" * 60)
    print(compressed[:300] + ("..." if len(compressed) > 300 else ""))

    return saved_pct


# ================================
# 테스트 데이터
# ================================

GIT_LOG_DATA = """commit a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
Author: John Doe <john@example.com>
Date:   Mon Apr 15 10:23:45 2026 +0900

    Add user authentication middleware

    This commit introduces JWT-based authentication for all API routes.
    The middleware checks for valid tokens in the Authorization header.

commit b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1
Author: Jane Smith <jane@example.com>
Date:   Sun Apr 14 18:42:11 2026 +0900

    Fix database connection pool exhaustion

    Increased pool size from 10 to 50 to handle concurrent requests.
    Added connection timeout handling.

commit c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2
Author: John Doe <john@example.com>
Date:   Sat Apr 13 14:15:33 2026 +0900

    Refactor payment processing module

    Split monolithic payment.py into separate modules:
    - payment/processor.py
    - payment/validator.py
    - payment/notifier.py

commit d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3
Author: Bob Wilson <bob@example.com>
Date:   Fri Apr 12 09:30:22 2026 +0900

    Update README with new API examples

    Added curl examples for all v2 endpoints.
    Documented authentication flow.

commit e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4
Author: Alice Lee <alice@example.com>
Date:   Thu Apr 11 16:45:18 2026 +0900

    Performance optimization for search endpoint

    - Added Redis caching for frequent queries
    - Reduced response time from 800ms to 120ms
    - Cache TTL: 5 minutes
""" * 5  # 5배 늘려서 더 큰 git log 시뮬레이션


NPM_TEST_DATA = """
> myapp@1.0.0 test
> jest

PASS  src/components/Button.test.js
  Button Component
    ✓ renders correctly (12 ms)
    ✓ handles click events (8 ms)
    ✓ applies custom className (5 ms)
    ✓ disables when prop is set (4 ms)

PASS  src/components/Input.test.js
  Input Component
    ✓ renders with placeholder (10 ms)
    ✓ updates value on change (7 ms)
    ✓ validates required field (15 ms)
    ✓ shows error message (9 ms)

FAIL  src/api/userService.test.js
  UserService
    ✓ creates new user (45 ms)
    ✓ retrieves user by id (12 ms)
    ✗ updates user profile (250 ms)

      Expected: { name: 'John Updated' }
      Received: { name: 'John' }

      at Object.<anonymous> (src/api/userService.test.js:45:23)
      at processTicksAndRejections (node:internal/process/task_queues:96:5)
      at runMicrotasks (node:internal/microtask_queue:42:5)

    ✗ deletes user account (180 ms)

      AssertionError: expected status 204, got 500

      at Object.<anonymous> (src/api/userService.test.js:67:12)

PASS  src/utils/validator.test.js
  Validator Utility
    ✓ validates email format (3 ms)
    ✓ validates phone number (4 ms)
    ✓ rejects invalid input (5 ms)

Test Suites: 1 failed, 3 passed, 4 total
Tests:       2 failed, 14 passed, 16 total
Snapshots:   0 total
Time:        4.523 s
Ran all test suites.
""" * 3


JSON_DATA = """{
  "users": [
    {"id": 1, "name": "John Doe", "email": "john@example.com", "role": "admin", "created_at": "2026-01-15T08:30:00Z", "last_login": "2026-04-15T10:23:45Z", "preferences": {"theme": "dark", "language": "en", "notifications": true}, "address": {"street": "123 Main St", "city": "Seoul", "country": "Korea", "postal_code": "12345"}, "phone": "+82-10-1234-5678"},
    {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "user", "created_at": "2026-02-20T14:15:00Z", "last_login": "2026-04-14T18:42:11Z", "preferences": {"theme": "light", "language": "ko", "notifications": false}, "address": {"street": "456 Oak Ave", "city": "Busan", "country": "Korea", "postal_code": "67890"}, "phone": "+82-10-9876-5432"},
    {"id": 3, "name": "Bob Wilson", "email": "bob@example.com", "role": "user", "created_at": "2026-03-05T09:00:00Z", "last_login": "2026-04-12T09:30:22Z", "preferences": {"theme": "dark", "language": "en", "notifications": true}, "address": {"street": "789 Pine Rd", "city": "Incheon", "country": "Korea", "postal_code": "11111"}, "phone": "+82-10-5555-1234"},
    {"id": 4, "name": "Alice Lee", "email": "alice@example.com", "role": "moderator", "created_at": "2026-03-12T11:30:00Z", "last_login": "2026-04-11T16:45:18Z", "preferences": {"theme": "auto", "language": "ko", "notifications": true}, "address": {"street": "321 Elm St", "city": "Daegu", "country": "Korea", "postal_code": "22222"}, "phone": "+82-10-2222-3333"},
    {"id": 5, "name": "Tom Brown", "email": "tom@example.com", "role": "user", "created_at": "2026-03-25T15:45:00Z", "last_login": "2026-04-10T20:15:00Z", "preferences": {"theme": "dark", "language": "en", "notifications": false}, "address": {"street": "555 Cedar Ln", "city": "Seoul", "country": "Korea", "postal_code": "33333"}, "phone": "+82-10-7777-8888"}
  ],
  "total": 5,
  "page": 1,
  "per_page": 20
}"""


LOG_DATA = """
2026-04-15 10:23:45 INFO  Starting application server on port 3000
2026-04-15 10:23:46 INFO  Connected to database successfully
2026-04-15 10:23:47 INFO  Redis cache initialized
2026-04-15 10:23:48 DEBUG Loading user routes
2026-04-15 10:23:48 DEBUG Loading product routes
2026-04-15 10:23:48 DEBUG Loading order routes
2026-04-15 10:24:01 INFO  GET /api/users 200 (45ms)
2026-04-15 10:24:05 INFO  GET /api/products 200 (120ms)
2026-04-15 10:24:12 WARN  Slow query detected: SELECT * FROM orders (1250ms)
2026-04-15 10:24:18 INFO  POST /api/orders 201 (89ms)
2026-04-15 10:24:25 ERROR Database connection timeout - retrying (1/3)
2026-04-15 10:24:28 ERROR Database connection timeout - retrying (2/3)
2026-04-15 10:24:31 INFO  Database reconnected successfully
2026-04-15 10:24:35 INFO  GET /api/users/123 200 (12ms)
2026-04-15 10:24:42 WARN  Cache miss for key: user:456
2026-04-15 10:24:48 INFO  POST /api/auth/login 200 (78ms)
2026-04-15 10:24:55 ERROR Failed to send email: SMTP server unreachable
2026-04-15 10:25:02 INFO  GET /api/products/789 200 (34ms)
2026-04-15 10:25:08 DEBUG User session created: user_id=123
2026-04-15 10:25:15 INFO  PUT /api/users/123 200 (56ms)
2026-04-15 10:25:22 ERROR Payment processing failed: Invalid card number
2026-04-15 10:25:30 WARN  Rate limit warning for user_id=456 (90/100 requests)
""" * 4


# ================================
# 벤치마크 실행
# ================================

print("\n" + "🍩 " * 30)
print("HOMER 벤치마크 - rtk 비교 측정")
print("🍩 " * 30)

results = []

results.append(("Git Log (50 commits)", run_benchmark(
    "Git Log (50 commits 시뮬레이션)",
    GIT_LOG_DATA,
    format_hint='git'
)))

results.append(("NPM Test (16 tests)", run_benchmark(
    "NPM Test 출력 (16 tests, 2 fails)",
    NPM_TEST_DATA,
    format_hint='test'
)))

results.append(("JSON API Response", run_benchmark(
    "JSON API 응답 (5 users)",
    JSON_DATA,
    format_hint='json'
)))

results.append(("Application Logs", run_benchmark(
    "애플리케이션 로그 (84 lines)",
    LOG_DATA,
    format_hint='log'
)))

# 새 필터 테스트
CSV_DATA = """user_id,name,email,age,department,salary,hire_date,manager_id,location,status
1,John Doe,john@example.com,32,Engineering,75000,2020-01-15,5,Seoul,active
2,Jane Smith,jane@example.com,28,Marketing,65000,2021-03-20,7,Busan,active
3,Bob Wilson,bob@example.com,45,Engineering,95000,2018-06-10,5,Seoul,active
4,Alice Lee,alice@example.com,30,HR,60000,2022-09-01,9,Daegu,active
5,Tom Brown,tom@example.com,38,Engineering,80000,2019-11-12,5,Seoul,inactive
""" * 10

STACKTRACE_DATA = """Traceback (most recent call last):
  File "/usr/local/lib/python3.11/site-packages/flask/app.py", line 2548, in __call__
    return self.wsgi_app(environ, start_response)
  File "/usr/local/lib/python3.11/site-packages/flask/app.py", line 2528, in wsgi_app
    response = self.handle_exception(e)
  File "/app/handlers/user_handler.py", line 145, in get_user
    user = User.query.filter_by(id=user_id).first()
  File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/query.py", line 2839, in first
    return self.limit(1)._iter().first()
  File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/query.py", line 2950, in _iter
    result = self.session.execute(statement, params, execution_options)
  File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2351, in execute
    return self._execute_internal(statement, params, execution_options=execution_options)
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not connect to server: Connection refused
[SQL: SELECT users.id, users.name FROM users WHERE users.id = %(id_1)s]
[parameters: {'id_1': 123}]
"""

DOCKER_PS_DATA = """CONTAINER ID   IMAGE              COMMAND                  CREATED         STATUS         PORTS                    NAMES
a3b4c5d6e7f8   postgres:14        "docker-entrypoint.s…"   2 hours ago     Up 2 hours     0.0.0.0:5432->5432/tcp   db-postgres
b4c5d6e7f8g9   redis:7-alpine     "docker-entrypoint.s…"   2 hours ago     Up 2 hours     0.0.0.0:6379->6379/tcp   cache-redis
c5d6e7f8g9h0   nginx:alpine       "/docker-entrypoint.…"   1 hour ago      Up 1 hour      0.0.0.0:80->80/tcp       web-server
d6e7f8g9h0i1   node:18            "node app.js"            30 minutes ago  Up 30 minutes  0.0.0.0:3000->3000/tcp   api-backend
e7f8g9h0i1j2   prometheus:latest  "/bin/prometheus --c…"   45 minutes ago  Up 45 minutes  0.0.0.0:9090->9090/tcp   monitoring
"""

results.append(("CSV Data", run_benchmark(
    "CSV 데이터 (50 rows)",
    CSV_DATA,
    format_hint='csv'
)))

results.append(("Python Stack Trace", run_benchmark(
    "Python Stack Trace (DB 연결 에러)",
    STACKTRACE_DATA,
    format_hint='stacktrace'
)))

results.append(("Docker PS", run_benchmark(
    "docker ps 출력 (5 containers)",
    DOCKER_PS_DATA,
    format_hint='docker'
)))

# ================================
# 최종 리포트
# ================================
print("\n\n" + "=" * 60)
print("📈 최종 결과 (Homer vs rtk)")
print("=" * 60)
print(f"{'시나리오':<35} {'Homer':<12} {'rtk (claim)':<15}")
print("-" * 60)

rtk_claims = {
    "Git Log (50 commits)": "60-90%",
    "NPM Test (16 tests)": "60-90%",
    "JSON API Response": "60-90%",
    "Application Logs": "60-90%",
}

for name, saved in results:
    homer_pct = f"{saved:.1f}%"
    rtk_pct = rtk_claims.get(name, "60-90%")
    print(f"{name:<35} {homer_pct:<12} {rtk_pct:<15}")

avg = sum(r[1] for r in results) / len(results)
print(f"\n📊 Homer 평균 절감률: {avg:.1f}%")
print(f"📊 rtk 주장 절감률: 60-90% (평균 약 75%)")

if avg > 75:
    print(f"\n✅ Homer가 rtk보다 우수합니다! ({avg-75:.1f}%p 우세)")
else:
    print(f"\n⚠️  Homer가 rtk보다 부족합니다. ({75-avg:.1f}%p 차이)")

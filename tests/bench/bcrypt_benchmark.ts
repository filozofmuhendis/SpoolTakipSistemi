import bcrypt from 'bcryptjs';

async function benchmark(rounds: number) {
    const password = 'extremely-secure-password-123';
    const iterations = 50;
    console.log(`\nBenchmarking Bcrypt with ${rounds} rounds...`);

    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
        await bcrypt.hash(password, rounds);
    }
    const end = Date.now();

    const total = end - start;
    const average = total / iterations;

    console.log(`Total time for ${iterations} iterations: ${total}ms`);
    console.log(`Average time per hash: ${average.toFixed(2)}ms`);
    return average;
}

async function runBenchmarks() {
    console.log('--- Bcrypt Performance Benchmark ---');
    const results = {
        8: await benchmark(8),
        10: await benchmark(10),
        12: await benchmark(12),
    };

    console.log('\n--- Summary ---');
    Object.entries(results).forEach(([rounds, time]) => {
        console.log(`${rounds} rounds: ${time.toFixed(2)}ms`);
        const tps = (1000 / time).toFixed(2);
        console.log(`   Approx. capacity: ${tps} hashes/sec per CPU core`);
    });
}

runBenchmarks().catch(console.error);

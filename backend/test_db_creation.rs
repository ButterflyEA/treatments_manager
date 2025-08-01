use sqlx::SqlitePool;
use std::fs;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Remove test database if it exists
    let _ = fs::remove_file("test_patients.db");
    let _ = fs::remove_file("test_patients.db-shm");
    let _ = fs::remove_file("test_patients.db-wal");
    
    println!("Testing database auto-creation...");
    
    // Check if database exists before connection
    let exists_before = std::path::Path::new("test_patients.db").exists();
    println!("Database exists before connection: {}", exists_before);
    
    // Connect to database (this should create it)
    let database_url = "sqlite:./test_patients.db?mode=rwc";
    let pool = SqlitePool::connect(database_url).await?;
    
    // Run migrations
    sqlx::migrate!("./migrations").run(&pool).await?;
    
    // Check if database exists after connection and migration
    let exists_after = std::path::Path::new("test_patients.db").exists();
    println!("Database exists after connection and migration: {}", exists_after);
    
    // Test that tables were created by running a simple query
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM patients")
        .fetch_one(&pool)
        .await?;
    println!("Patients table accessible, current count: {}", count.0);
    
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM treatments")
        .fetch_one(&pool)
        .await?;
    println!("Treatments table accessible, current count: {}", count.0);
    
    // Clean up
    pool.close().await;
    let _ = fs::remove_file("test_patients.db");
    let _ = fs::remove_file("test_patients.db-shm");
    let _ = fs::remove_file("test_patients.db-wal");
    
    println!("✅ Database auto-creation test completed successfully!");
    
    Ok(())
}

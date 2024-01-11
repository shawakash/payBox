use actix_web::{web, App, HttpServer, HttpResponse, Responder};
use solana_sdk::program_error::ProgramError;
use tokio::task::spawn_blocking;
use serde_json::{json, Value};
use std::time::{SystemTime, UNIX_EPOCH};
use chrono::{DateTime, Utc};

use solana_program::entrypoint as solana_entrypoint;


fn index_blocks(start_slot: u64, end_slot: u64) -> Result<(), ProgramError> {
    // Your Solana blockchain indexing logic goes here
    // Use the solana-sdk crate to interact with the blockchain

    println!("Indexing blocks from {} to {}", start_slot, end_slot);

    Ok(())
}

async fn handle_rpc(args: web::Json<Value>) -> impl Responder {
    let start_slot = args["start_slot"].as_u64().unwrap_or(0);
    let end_slot = args["end_slot"].as_u64().unwrap_or(0);

    // Spawn a blocking task for Solana indexing (assuming it's a CPU-bound operation)
    spawn_blocking(move || {
        if let Err(err) = index_blocks(start_slot, end_slot) {
            eprintln!("Error indexing blocks: {:?}", err);
        }
    })
    .await;
    let response = json!({
        "message": "Indexing in progress"
    });
    HttpResponse::Ok().json(response)
}

async fn health_check(start_time: DateTime<Utc>) -> impl Responder {

    let current_time = Utc::now();
    let formatted_start_time = start_time.format("%Y-%m-%d %H:%M:%S UTC").to_string();
    let formatted_current_time = current_time.format("%Y-%m-%d %H:%M:%S UTC").to_string();


    let response = json!({
        "uptime": formatted_start_time,
        "current_date": formatted_current_time,
        "message": "OK"
    });

    HttpResponse::Ok().json(response)
}

async fn welcome() -> impl Responder {
    let response = json!({
        "message": "Welcome to the Solana Indexer"
    });
    HttpResponse::Ok().body("hola")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let uptime = Utc::now();
    println!("Starting Solana Indexer server on http://127.0.0.1:8080...");

    HttpServer::new(move || {
        App::new()
            .service(web::resource("/rpc").route(web::post().to(handle_rpc)))
            .service(web::resource("/_health").route(web::get().to(move || health_check(uptime))))
            .service(web::resource("/").route(web::get().to(welcome)))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

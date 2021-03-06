{
    "targets": [
        {
            "target_name": "krillcoin_node",
            "sources": [
                "src/native/argon2.c",
                "src/native/blake2b.c",
                "src/native/core.c",
                "src/native/encoding.c",
                "src/native/krillcoin_native.c",
                "src/native/ref.c",
                "src/native/ed25519/collective.c",
                "src/native/ed25519/fe.c",
                "src/native/ed25519/ge.c",
                "src/native/ed25519/keypair.c",
                "src/native/ed25519/memory.c",
                "src/native/ed25519/sc.c",
                "src/native/ed25519/sha512.c",
                "src/native/ed25519/sign.c",
                "src/native/ed25519/verify.c",
                "src/native/krillcoin_node.cc"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")"
            ],
            "cflags_c": [
                "-std=c99"
            ]
        }
    ]
}

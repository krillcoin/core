#ifndef __KRILL_NATIVE_H
#define __KRILL_NATIVE_H

#include "argon2.h"
#include "blake2.h"
#include "sha256.h"

#define KRILL_ARGON2_SALT "krillrocks!"
#define KRILL_ARGON2_SALT_LEN 11
#define KRILL_DEFAULT_ARGON2_COST 512

int krill_blake2(void *out, const void *in, const size_t inlen);
int krill_argon2(void *out, const void *in, const size_t inlen, const uint32_t m_cost);
int krill_kdf(void *out, const void *in, const size_t inlen, const void* seed, const size_t seedlen, const uint32_t m_cost, const uint32_t iter);
uint32_t krill_argon2_target(void *out, void *in, const size_t inlen, const uint32_t compact, const uint32_t min_nonce, const uint32_t max_nonce, const uint32_t m_cost);
int krill_argon2_verify(const void *hash, const void *in, const size_t inlen, const uint32_t m_cost);
void krill_sha256(void *out, const void *in, const size_t inlen);

#endif

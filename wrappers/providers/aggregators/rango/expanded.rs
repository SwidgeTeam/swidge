#![feature(prelude_import)]
#[prelude_import]
use std::prelude::rust_2021::*;
#[macro_use]
extern crate std;
pub mod wrap {
    pub mod entry {
        use crate::{get_metadata_wrapped, quote_wrapped};
        use polywrap_wasm_rs::{abort, invoke, InvokeArgs};
        #[no_mangle]
        pub extern "C" fn _wrap_invoke(
            method_size: u32,
            args_size: u32,
            env_size: u32,
        ) -> bool {
            abort::wrap_abort_setup();
            let args: InvokeArgs = invoke::wrap_invoke_args(method_size, args_size);
            match args.method.as_str() {
                "getMetadata" => {
                    invoke::wrap_invoke(args, env_size, Some(get_metadata_wrapped))
                }
                "quote" => invoke::wrap_invoke(args, env_size, Some(quote_wrapped)),
                _ => invoke::wrap_invoke(args, env_size, None),
            }
        }
    }
    pub mod metadata {
        use serde::{Serialize, Deserialize};
        pub mod serialization {
            use std::convert::TryFrom;
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                ReadDecoder, Write, WriteEncoder, JSON,
            };
            use crate::Metadata;
            pub fn serialize_metadata(args: &Metadata) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) object-type: Metadata"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_metadata(args, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_metadata<W: Write>(
                args: &Metadata,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.write_map_length(&1)?;
                writer.context().push("result", "String", "writing property");
                writer.write_string("result")?;
                writer.write_string(&args.result)?;
                writer.context().pop();
                Ok(())
            }
            pub fn deserialize_metadata(args: &[u8]) -> Result<Metadata, DecodeError> {
                let mut context = Context::new();
                context.description = "Deserializing object-type: Metadata".to_string();
                let mut reader = ReadDecoder::new(args, context);
                read_metadata(&mut reader)
            }
            pub fn read_metadata<R: Read>(
                reader: &mut R,
            ) -> Result<Metadata, DecodeError> {
                let mut num_of_fields = reader.read_map_length()?;
                let mut _result: String = String::new();
                let mut _result_set = false;
                while num_of_fields > 0 {
                    num_of_fields -= 1;
                    let field = reader.read_string()?;
                    match field.as_str() {
                        "result" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _result = reader.read_string()?;
                            _result_set = true;
                            reader.context().pop();
                        }
                        err => return Err(DecodeError::UnknownFieldName(err.to_string())),
                    }
                }
                if !_result_set {
                    return Err(DecodeError::MissingField("result: String.".to_string()));
                }
                Ok(Metadata { result: _result })
            }
        }
        use polywrap_wasm_rs::{
            BigInt, BigNumber, Map, DecodeError, EncodeError, Read, Write, JSON,
        };
        pub use serialization::{
            deserialize_metadata, read_metadata, serialize_metadata, write_metadata,
        };
        pub struct Metadata {
            pub result: String,
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::clone::Clone for Metadata {
            #[inline]
            fn clone(&self) -> Metadata {
                Metadata {
                    result: ::core::clone::Clone::clone(&self.result),
                }
            }
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::fmt::Debug for Metadata {
            fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                ::core::fmt::Formatter::debug_struct_field1_finish(
                    f,
                    "Metadata",
                    "result",
                    &&self.result,
                )
            }
        }
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl<'de> _serde::Deserialize<'de> for Metadata {
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    #[allow(non_camel_case_types)]
                    enum __Field {
                        __field0,
                        __ignore,
                    }
                    struct __FieldVisitor;
                    impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                        type Value = __Field;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "field identifier",
                            )
                        }
                        fn visit_u64<__E>(
                            self,
                            __value: u64,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                0u64 => _serde::__private::Ok(__Field::__field0),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_str<__E>(
                            self,
                            __value: &str,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                "result" => _serde::__private::Ok(__Field::__field0),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_bytes<__E>(
                            self,
                            __value: &[u8],
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                b"result" => _serde::__private::Ok(__Field::__field0),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                    }
                    impl<'de> _serde::Deserialize<'de> for __Field {
                        #[inline]
                        fn deserialize<__D>(
                            __deserializer: __D,
                        ) -> _serde::__private::Result<Self, __D::Error>
                        where
                            __D: _serde::Deserializer<'de>,
                        {
                            _serde::Deserializer::deserialize_identifier(
                                __deserializer,
                                __FieldVisitor,
                            )
                        }
                    }
                    struct __Visitor<'de> {
                        marker: _serde::__private::PhantomData<Metadata>,
                        lifetime: _serde::__private::PhantomData<&'de ()>,
                    }
                    impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                        type Value = Metadata;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "struct Metadata",
                            )
                        }
                        #[inline]
                        fn visit_seq<__A>(
                            self,
                            mut __seq: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::SeqAccess<'de>,
                        {
                            let __field0 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            0usize,
                                            &"struct Metadata with 1 element",
                                        ),
                                    );
                                }
                            };
                            _serde::__private::Ok(Metadata { result: __field0 })
                        }
                        #[inline]
                        fn visit_map<__A>(
                            self,
                            mut __map: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::MapAccess<'de>,
                        {
                            let mut __field0: _serde::__private::Option<String> = _serde::__private::None;
                            while let _serde::__private::Some(__key)
                                = match _serde::de::MapAccess::next_key::<
                                    __Field,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                match __key {
                                    __Field::__field0 => {
                                        if _serde::__private::Option::is_some(&__field0) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field("result"),
                                            );
                                        }
                                        __field0 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    _ => {
                                        let _ = match _serde::de::MapAccess::next_value::<
                                            _serde::de::IgnoredAny,
                                        >(&mut __map) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                    }
                                }
                            }
                            let __field0 = match __field0 {
                                _serde::__private::Some(__field0) => __field0,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("result") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            _serde::__private::Ok(Metadata { result: __field0 })
                        }
                    }
                    const FIELDS: &'static [&'static str] = &["result"];
                    _serde::Deserializer::deserialize_struct(
                        __deserializer,
                        "Metadata",
                        FIELDS,
                        __Visitor {
                            marker: _serde::__private::PhantomData::<Metadata>,
                            lifetime: _serde::__private::PhantomData,
                        },
                    )
                }
            }
        };
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl _serde::Serialize for Metadata {
                fn serialize<__S>(
                    &self,
                    __serializer: __S,
                ) -> _serde::__private::Result<__S::Ok, __S::Error>
                where
                    __S: _serde::Serializer,
                {
                    let mut __serde_state = match _serde::Serializer::serialize_struct(
                        __serializer,
                        "Metadata",
                        false as usize + 1,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "result",
                        &self.result,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    _serde::ser::SerializeStruct::end(__serde_state)
                }
            }
        };
        impl Metadata {
            pub fn new() -> Metadata {
                Metadata { result: String::new() }
            }
            pub fn to_buffer(args: &Metadata) -> Result<Vec<u8>, EncodeError> {
                serialize_metadata(args)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn from_buffer(args: &[u8]) -> Result<Metadata, DecodeError> {
                deserialize_metadata(args)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
            pub fn write<W: Write>(
                args: &Metadata,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                write_metadata(args, writer)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn read<R: Read>(reader: &mut R) -> Result<Metadata, DecodeError> {
                read_metadata(reader)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
        }
    }
    pub use metadata::Metadata;
    pub mod quote_request {
        use serde::{Serialize, Deserialize};
        pub mod serialization {
            use std::convert::TryFrom;
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                ReadDecoder, Write, WriteEncoder, JSON,
            };
            use crate::QuoteRequest;
            use crate::Token;
            pub fn serialize_quote_request(
                args: &QuoteRequest,
            ) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) object-type: QuoteRequest"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_quote_request(args, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_quote_request<W: Write>(
                args: &QuoteRequest,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.write_map_length(&6)?;
                writer.context().push("tokenIn", "Token", "writing property");
                writer.write_string("tokenIn")?;
                Token::write(&args.token_in, writer)?;
                writer.context().pop();
                writer.context().push("tokenOut", "Token", "writing property");
                writer.write_string("tokenOut")?;
                Token::write(&args.token_out, writer)?;
                writer.context().pop();
                writer.context().push("amountIn", "String", "writing property");
                writer.write_string("amountIn")?;
                writer.write_string(&args.amount_in)?;
                writer.context().pop();
                writer.context().push("slippage", "BigInt", "writing property");
                writer.write_string("slippage")?;
                writer.write_bigint(&args.slippage)?;
                writer.context().pop();
                writer.context().push("senderAddress", "String", "writing property");
                writer.write_string("senderAddress")?;
                writer.write_string(&args.sender_address)?;
                writer.context().pop();
                writer.context().push("receiverAddress", "String", "writing property");
                writer.write_string("receiverAddress")?;
                writer.write_string(&args.receiver_address)?;
                writer.context().pop();
                Ok(())
            }
            pub fn deserialize_quote_request(
                args: &[u8],
            ) -> Result<QuoteRequest, DecodeError> {
                let mut context = Context::new();
                context
                    .description = "Deserializing object-type: QuoteRequest".to_string();
                let mut reader = ReadDecoder::new(args, context);
                read_quote_request(&mut reader)
            }
            pub fn read_quote_request<R: Read>(
                reader: &mut R,
            ) -> Result<QuoteRequest, DecodeError> {
                let mut num_of_fields = reader.read_map_length()?;
                let mut _token_in: Token = Token::new();
                let mut _token_in_set = false;
                let mut _token_out: Token = Token::new();
                let mut _token_out_set = false;
                let mut _amount_in: String = String::new();
                let mut _amount_in_set = false;
                let mut _slippage: BigInt = BigInt::default();
                let mut _slippage_set = false;
                let mut _sender_address: String = String::new();
                let mut _sender_address_set = false;
                let mut _receiver_address: String = String::new();
                let mut _receiver_address_set = false;
                while num_of_fields > 0 {
                    num_of_fields -= 1;
                    let field = reader.read_string()?;
                    match field.as_str() {
                        "tokenIn" => {
                            reader
                                .context()
                                .push(&field, "Token", "type found, reading property");
                            let object = Token::read(reader)?;
                            _token_in = object;
                            _token_in_set = true;
                            reader.context().pop();
                        }
                        "tokenOut" => {
                            reader
                                .context()
                                .push(&field, "Token", "type found, reading property");
                            let object = Token::read(reader)?;
                            _token_out = object;
                            _token_out_set = true;
                            reader.context().pop();
                        }
                        "amountIn" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _amount_in = reader.read_string()?;
                            _amount_in_set = true;
                            reader.context().pop();
                        }
                        "slippage" => {
                            reader
                                .context()
                                .push(&field, "BigInt", "type found, reading property");
                            _slippage = reader.read_bigint()?;
                            _slippage_set = true;
                            reader.context().pop();
                        }
                        "senderAddress" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _sender_address = reader.read_string()?;
                            _sender_address_set = true;
                            reader.context().pop();
                        }
                        "receiverAddress" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _receiver_address = reader.read_string()?;
                            _receiver_address_set = true;
                            reader.context().pop();
                        }
                        err => return Err(DecodeError::UnknownFieldName(err.to_string())),
                    }
                }
                if !_token_in_set {
                    return Err(DecodeError::MissingField("tokenIn: Token.".to_string()));
                }
                if !_token_out_set {
                    return Err(
                        DecodeError::MissingField("tokenOut: Token.".to_string()),
                    );
                }
                if !_amount_in_set {
                    return Err(
                        DecodeError::MissingField("amountIn: String.".to_string()),
                    );
                }
                if !_slippage_set {
                    return Err(
                        DecodeError::MissingField("slippage: BigInt.".to_string()),
                    );
                }
                if !_sender_address_set {
                    return Err(
                        DecodeError::MissingField("senderAddress: String.".to_string()),
                    );
                }
                if !_receiver_address_set {
                    return Err(
                        DecodeError::MissingField("receiverAddress: String.".to_string()),
                    );
                }
                Ok(QuoteRequest {
                    token_in: _token_in,
                    token_out: _token_out,
                    amount_in: _amount_in,
                    slippage: _slippage,
                    sender_address: _sender_address,
                    receiver_address: _receiver_address,
                })
            }
        }
        use polywrap_wasm_rs::{
            BigInt, BigNumber, Map, DecodeError, EncodeError, Read, Write, JSON,
        };
        pub use serialization::{
            deserialize_quote_request, read_quote_request, serialize_quote_request,
            write_quote_request,
        };
        use crate::Token;
        pub struct QuoteRequest {
            pub token_in: Token,
            pub token_out: Token,
            pub amount_in: String,
            pub slippage: BigInt,
            pub sender_address: String,
            pub receiver_address: String,
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::clone::Clone for QuoteRequest {
            #[inline]
            fn clone(&self) -> QuoteRequest {
                QuoteRequest {
                    token_in: ::core::clone::Clone::clone(&self.token_in),
                    token_out: ::core::clone::Clone::clone(&self.token_out),
                    amount_in: ::core::clone::Clone::clone(&self.amount_in),
                    slippage: ::core::clone::Clone::clone(&self.slippage),
                    sender_address: ::core::clone::Clone::clone(&self.sender_address),
                    receiver_address: ::core::clone::Clone::clone(&self.receiver_address),
                }
            }
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::fmt::Debug for QuoteRequest {
            fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                {
                    let names: &'static _ = &[
                        "token_in",
                        "token_out",
                        "amount_in",
                        "slippage",
                        "sender_address",
                        "receiver_address",
                    ];
                    let values: &[&dyn ::core::fmt::Debug] = &[
                        &&self.token_in,
                        &&self.token_out,
                        &&self.amount_in,
                        &&self.slippage,
                        &&self.sender_address,
                        &&self.receiver_address,
                    ];
                    ::core::fmt::Formatter::debug_struct_fields_finish(
                        f,
                        "QuoteRequest",
                        names,
                        values,
                    )
                }
            }
        }
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl<'de> _serde::Deserialize<'de> for QuoteRequest {
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    #[allow(non_camel_case_types)]
                    enum __Field {
                        __field0,
                        __field1,
                        __field2,
                        __field3,
                        __field4,
                        __field5,
                        __ignore,
                    }
                    struct __FieldVisitor;
                    impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                        type Value = __Field;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "field identifier",
                            )
                        }
                        fn visit_u64<__E>(
                            self,
                            __value: u64,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                0u64 => _serde::__private::Ok(__Field::__field0),
                                1u64 => _serde::__private::Ok(__Field::__field1),
                                2u64 => _serde::__private::Ok(__Field::__field2),
                                3u64 => _serde::__private::Ok(__Field::__field3),
                                4u64 => _serde::__private::Ok(__Field::__field4),
                                5u64 => _serde::__private::Ok(__Field::__field5),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_str<__E>(
                            self,
                            __value: &str,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                "token_in" => _serde::__private::Ok(__Field::__field0),
                                "token_out" => _serde::__private::Ok(__Field::__field1),
                                "amount_in" => _serde::__private::Ok(__Field::__field2),
                                "slippage" => _serde::__private::Ok(__Field::__field3),
                                "sender_address" => _serde::__private::Ok(__Field::__field4),
                                "receiver_address" => {
                                    _serde::__private::Ok(__Field::__field5)
                                }
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_bytes<__E>(
                            self,
                            __value: &[u8],
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                b"token_in" => _serde::__private::Ok(__Field::__field0),
                                b"token_out" => _serde::__private::Ok(__Field::__field1),
                                b"amount_in" => _serde::__private::Ok(__Field::__field2),
                                b"slippage" => _serde::__private::Ok(__Field::__field3),
                                b"sender_address" => {
                                    _serde::__private::Ok(__Field::__field4)
                                }
                                b"receiver_address" => {
                                    _serde::__private::Ok(__Field::__field5)
                                }
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                    }
                    impl<'de> _serde::Deserialize<'de> for __Field {
                        #[inline]
                        fn deserialize<__D>(
                            __deserializer: __D,
                        ) -> _serde::__private::Result<Self, __D::Error>
                        where
                            __D: _serde::Deserializer<'de>,
                        {
                            _serde::Deserializer::deserialize_identifier(
                                __deserializer,
                                __FieldVisitor,
                            )
                        }
                    }
                    struct __Visitor<'de> {
                        marker: _serde::__private::PhantomData<QuoteRequest>,
                        lifetime: _serde::__private::PhantomData<&'de ()>,
                    }
                    impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                        type Value = QuoteRequest;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "struct QuoteRequest",
                            )
                        }
                        #[inline]
                        fn visit_seq<__A>(
                            self,
                            mut __seq: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::SeqAccess<'de>,
                        {
                            let __field0 = match match _serde::de::SeqAccess::next_element::<
                                Token,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            0usize,
                                            &"struct QuoteRequest with 6 elements",
                                        ),
                                    );
                                }
                            };
                            let __field1 = match match _serde::de::SeqAccess::next_element::<
                                Token,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            1usize,
                                            &"struct QuoteRequest with 6 elements",
                                        ),
                                    );
                                }
                            };
                            let __field2 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            2usize,
                                            &"struct QuoteRequest with 6 elements",
                                        ),
                                    );
                                }
                            };
                            let __field3 = match match _serde::de::SeqAccess::next_element::<
                                BigInt,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            3usize,
                                            &"struct QuoteRequest with 6 elements",
                                        ),
                                    );
                                }
                            };
                            let __field4 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            4usize,
                                            &"struct QuoteRequest with 6 elements",
                                        ),
                                    );
                                }
                            };
                            let __field5 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            5usize,
                                            &"struct QuoteRequest with 6 elements",
                                        ),
                                    );
                                }
                            };
                            _serde::__private::Ok(QuoteRequest {
                                token_in: __field0,
                                token_out: __field1,
                                amount_in: __field2,
                                slippage: __field3,
                                sender_address: __field4,
                                receiver_address: __field5,
                            })
                        }
                        #[inline]
                        fn visit_map<__A>(
                            self,
                            mut __map: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::MapAccess<'de>,
                        {
                            let mut __field0: _serde::__private::Option<Token> = _serde::__private::None;
                            let mut __field1: _serde::__private::Option<Token> = _serde::__private::None;
                            let mut __field2: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field3: _serde::__private::Option<BigInt> = _serde::__private::None;
                            let mut __field4: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field5: _serde::__private::Option<String> = _serde::__private::None;
                            while let _serde::__private::Some(__key)
                                = match _serde::de::MapAccess::next_key::<
                                    __Field,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                match __key {
                                    __Field::__field0 => {
                                        if _serde::__private::Option::is_some(&__field0) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "token_in",
                                                ),
                                            );
                                        }
                                        __field0 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                Token,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field1 => {
                                        if _serde::__private::Option::is_some(&__field1) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "token_out",
                                                ),
                                            );
                                        }
                                        __field1 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                Token,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field2 => {
                                        if _serde::__private::Option::is_some(&__field2) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "amount_in",
                                                ),
                                            );
                                        }
                                        __field2 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field3 => {
                                        if _serde::__private::Option::is_some(&__field3) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "slippage",
                                                ),
                                            );
                                        }
                                        __field3 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                BigInt,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field4 => {
                                        if _serde::__private::Option::is_some(&__field4) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "sender_address",
                                                ),
                                            );
                                        }
                                        __field4 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field5 => {
                                        if _serde::__private::Option::is_some(&__field5) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "receiver_address",
                                                ),
                                            );
                                        }
                                        __field5 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    _ => {
                                        let _ = match _serde::de::MapAccess::next_value::<
                                            _serde::de::IgnoredAny,
                                        >(&mut __map) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                    }
                                }
                            }
                            let __field0 = match __field0 {
                                _serde::__private::Some(__field0) => __field0,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("token_in") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field1 = match __field1 {
                                _serde::__private::Some(__field1) => __field1,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("token_out") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field2 = match __field2 {
                                _serde::__private::Some(__field2) => __field2,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("amount_in") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field3 = match __field3 {
                                _serde::__private::Some(__field3) => __field3,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("slippage") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field4 = match __field4 {
                                _serde::__private::Some(__field4) => __field4,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field(
                                        "sender_address",
                                    ) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field5 = match __field5 {
                                _serde::__private::Some(__field5) => __field5,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field(
                                        "receiver_address",
                                    ) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            _serde::__private::Ok(QuoteRequest {
                                token_in: __field0,
                                token_out: __field1,
                                amount_in: __field2,
                                slippage: __field3,
                                sender_address: __field4,
                                receiver_address: __field5,
                            })
                        }
                    }
                    const FIELDS: &'static [&'static str] = &[
                        "token_in",
                        "token_out",
                        "amount_in",
                        "slippage",
                        "sender_address",
                        "receiver_address",
                    ];
                    _serde::Deserializer::deserialize_struct(
                        __deserializer,
                        "QuoteRequest",
                        FIELDS,
                        __Visitor {
                            marker: _serde::__private::PhantomData::<QuoteRequest>,
                            lifetime: _serde::__private::PhantomData,
                        },
                    )
                }
            }
        };
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl _serde::Serialize for QuoteRequest {
                fn serialize<__S>(
                    &self,
                    __serializer: __S,
                ) -> _serde::__private::Result<__S::Ok, __S::Error>
                where
                    __S: _serde::Serializer,
                {
                    let mut __serde_state = match _serde::Serializer::serialize_struct(
                        __serializer,
                        "QuoteRequest",
                        false as usize + 1 + 1 + 1 + 1 + 1 + 1,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "token_in",
                        &self.token_in,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "token_out",
                        &self.token_out,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "amount_in",
                        &self.amount_in,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "slippage",
                        &self.slippage,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "sender_address",
                        &self.sender_address,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "receiver_address",
                        &self.receiver_address,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    _serde::ser::SerializeStruct::end(__serde_state)
                }
            }
        };
        impl QuoteRequest {
            pub fn new() -> QuoteRequest {
                QuoteRequest {
                    token_in: Token::new(),
                    token_out: Token::new(),
                    amount_in: String::new(),
                    slippage: BigInt::default(),
                    sender_address: String::new(),
                    receiver_address: String::new(),
                }
            }
            pub fn to_buffer(args: &QuoteRequest) -> Result<Vec<u8>, EncodeError> {
                serialize_quote_request(args)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn from_buffer(args: &[u8]) -> Result<QuoteRequest, DecodeError> {
                deserialize_quote_request(args)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
            pub fn write<W: Write>(
                args: &QuoteRequest,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                write_quote_request(args, writer)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn read<R: Read>(reader: &mut R) -> Result<QuoteRequest, DecodeError> {
                read_quote_request(reader)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
        }
    }
    pub use quote_request::QuoteRequest;
    pub mod quote_response {
        use serde::{Serialize, Deserialize};
        pub mod serialization {
            use std::convert::TryFrom;
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                ReadDecoder, Write, WriteEncoder, JSON,
            };
            use crate::QuoteResponse;
            use crate::AggregatorDetails;
            use crate::RouteResume;
            use crate::ProviderDetails;
            use crate::TransactionDetails;
            pub fn serialize_quote_response(
                args: &QuoteResponse,
            ) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) object-type: QuoteResponse"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_quote_response(args, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_quote_response<W: Write>(
                args: &QuoteResponse,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.write_map_length(&6)?;
                writer
                    .context()
                    .push("aggregator", "AggregatorDetails", "writing property");
                writer.write_string("aggregator")?;
                AggregatorDetails::write(&args.aggregator, writer)?;
                writer.context().pop();
                writer.context().push("resume", "RouteResume", "writing property");
                writer.write_string("resume")?;
                RouteResume::write(&args.resume, writer)?;
                writer.context().pop();
                writer.context().push("fees", "String", "writing property");
                writer.write_string("fees")?;
                writer.write_string(&args.fees)?;
                writer.context().pop();
                writer
                    .context()
                    .push("providerDetails", "Vec<ProviderDetails>", "writing property");
                writer.write_string("providerDetails")?;
                writer
                    .write_array(
                        &args.provider_details,
                        |writer, item| { ProviderDetails::write(item, writer) },
                    )?;
                writer.context().pop();
                writer.context().push("approvalContract", "String", "writing property");
                writer.write_string("approvalContract")?;
                writer.write_string(&args.approval_contract)?;
                writer.context().pop();
                writer
                    .context()
                    .push(
                        "transactionDetails",
                        "TransactionDetails",
                        "writing property",
                    );
                writer.write_string("transactionDetails")?;
                TransactionDetails::write(&args.transaction_details, writer)?;
                writer.context().pop();
                Ok(())
            }
            pub fn deserialize_quote_response(
                args: &[u8],
            ) -> Result<QuoteResponse, DecodeError> {
                let mut context = Context::new();
                context
                    .description = "Deserializing object-type: QuoteResponse"
                    .to_string();
                let mut reader = ReadDecoder::new(args, context);
                read_quote_response(&mut reader)
            }
            pub fn read_quote_response<R: Read>(
                reader: &mut R,
            ) -> Result<QuoteResponse, DecodeError> {
                let mut num_of_fields = reader.read_map_length()?;
                let mut _aggregator: AggregatorDetails = AggregatorDetails::new();
                let mut _aggregator_set = false;
                let mut _resume: RouteResume = RouteResume::new();
                let mut _resume_set = false;
                let mut _fees: String = String::new();
                let mut _fees_set = false;
                let mut _provider_details: Vec<ProviderDetails> = ::alloc::vec::Vec::new();
                let mut _provider_details_set = false;
                let mut _approval_contract: String = String::new();
                let mut _approval_contract_set = false;
                let mut _transaction_details: TransactionDetails = TransactionDetails::new();
                let mut _transaction_details_set = false;
                while num_of_fields > 0 {
                    num_of_fields -= 1;
                    let field = reader.read_string()?;
                    match field.as_str() {
                        "aggregator" => {
                            reader
                                .context()
                                .push(
                                    &field,
                                    "AggregatorDetails",
                                    "type found, reading property",
                                );
                            let object = AggregatorDetails::read(reader)?;
                            _aggregator = object;
                            _aggregator_set = true;
                            reader.context().pop();
                        }
                        "resume" => {
                            reader
                                .context()
                                .push(
                                    &field,
                                    "RouteResume",
                                    "type found, reading property",
                                );
                            let object = RouteResume::read(reader)?;
                            _resume = object;
                            _resume_set = true;
                            reader.context().pop();
                        }
                        "fees" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _fees = reader.read_string()?;
                            _fees_set = true;
                            reader.context().pop();
                        }
                        "providerDetails" => {
                            reader
                                .context()
                                .push(
                                    &field,
                                    "Vec<ProviderDetails>",
                                    "type found, reading property",
                                );
                            _provider_details = reader
                                .read_array(|reader| {
                                    let object = ProviderDetails::read(reader)?;
                                    Ok(object)
                                })?;
                            _provider_details_set = true;
                            reader.context().pop();
                        }
                        "approvalContract" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _approval_contract = reader.read_string()?;
                            _approval_contract_set = true;
                            reader.context().pop();
                        }
                        "transactionDetails" => {
                            reader
                                .context()
                                .push(
                                    &field,
                                    "TransactionDetails",
                                    "type found, reading property",
                                );
                            let object = TransactionDetails::read(reader)?;
                            _transaction_details = object;
                            _transaction_details_set = true;
                            reader.context().pop();
                        }
                        err => return Err(DecodeError::UnknownFieldName(err.to_string())),
                    }
                }
                if !_aggregator_set {
                    return Err(
                        DecodeError::MissingField(
                            "aggregator: AggregatorDetails.".to_string(),
                        ),
                    );
                }
                if !_resume_set {
                    return Err(
                        DecodeError::MissingField("resume: RouteResume.".to_string()),
                    );
                }
                if !_fees_set {
                    return Err(DecodeError::MissingField("fees: String.".to_string()));
                }
                if !_provider_details_set {
                    return Err(
                        DecodeError::MissingField(
                            "providerDetails: [ProviderDetails].".to_string(),
                        ),
                    );
                }
                if !_approval_contract_set {
                    return Err(
                        DecodeError::MissingField(
                            "approvalContract: String.".to_string(),
                        ),
                    );
                }
                if !_transaction_details_set {
                    return Err(
                        DecodeError::MissingField(
                            "transactionDetails: TransactionDetails.".to_string(),
                        ),
                    );
                }
                Ok(QuoteResponse {
                    aggregator: _aggregator,
                    resume: _resume,
                    fees: _fees,
                    provider_details: _provider_details,
                    approval_contract: _approval_contract,
                    transaction_details: _transaction_details,
                })
            }
        }
        use polywrap_wasm_rs::{
            BigInt, BigNumber, Map, DecodeError, EncodeError, Read, Write, JSON,
        };
        pub use serialization::{
            deserialize_quote_response, read_quote_response, serialize_quote_response,
            write_quote_response,
        };
        use crate::AggregatorDetails;
        use crate::RouteResume;
        use crate::ProviderDetails;
        use crate::TransactionDetails;
        pub struct QuoteResponse {
            pub aggregator: AggregatorDetails,
            pub resume: RouteResume,
            pub fees: String,
            pub provider_details: Vec<ProviderDetails>,
            pub approval_contract: String,
            pub transaction_details: TransactionDetails,
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::clone::Clone for QuoteResponse {
            #[inline]
            fn clone(&self) -> QuoteResponse {
                QuoteResponse {
                    aggregator: ::core::clone::Clone::clone(&self.aggregator),
                    resume: ::core::clone::Clone::clone(&self.resume),
                    fees: ::core::clone::Clone::clone(&self.fees),
                    provider_details: ::core::clone::Clone::clone(
                        &self.provider_details,
                    ),
                    approval_contract: ::core::clone::Clone::clone(
                        &self.approval_contract,
                    ),
                    transaction_details: ::core::clone::Clone::clone(
                        &self.transaction_details,
                    ),
                }
            }
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::fmt::Debug for QuoteResponse {
            fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                {
                    let names: &'static _ = &[
                        "aggregator",
                        "resume",
                        "fees",
                        "provider_details",
                        "approval_contract",
                        "transaction_details",
                    ];
                    let values: &[&dyn ::core::fmt::Debug] = &[
                        &&self.aggregator,
                        &&self.resume,
                        &&self.fees,
                        &&self.provider_details,
                        &&self.approval_contract,
                        &&self.transaction_details,
                    ];
                    ::core::fmt::Formatter::debug_struct_fields_finish(
                        f,
                        "QuoteResponse",
                        names,
                        values,
                    )
                }
            }
        }
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl<'de> _serde::Deserialize<'de> for QuoteResponse {
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    #[allow(non_camel_case_types)]
                    enum __Field {
                        __field0,
                        __field1,
                        __field2,
                        __field3,
                        __field4,
                        __field5,
                        __ignore,
                    }
                    struct __FieldVisitor;
                    impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                        type Value = __Field;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "field identifier",
                            )
                        }
                        fn visit_u64<__E>(
                            self,
                            __value: u64,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                0u64 => _serde::__private::Ok(__Field::__field0),
                                1u64 => _serde::__private::Ok(__Field::__field1),
                                2u64 => _serde::__private::Ok(__Field::__field2),
                                3u64 => _serde::__private::Ok(__Field::__field3),
                                4u64 => _serde::__private::Ok(__Field::__field4),
                                5u64 => _serde::__private::Ok(__Field::__field5),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_str<__E>(
                            self,
                            __value: &str,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                "aggregator" => _serde::__private::Ok(__Field::__field0),
                                "resume" => _serde::__private::Ok(__Field::__field1),
                                "fees" => _serde::__private::Ok(__Field::__field2),
                                "provider_details" => {
                                    _serde::__private::Ok(__Field::__field3)
                                }
                                "approval_contract" => {
                                    _serde::__private::Ok(__Field::__field4)
                                }
                                "transaction_details" => {
                                    _serde::__private::Ok(__Field::__field5)
                                }
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_bytes<__E>(
                            self,
                            __value: &[u8],
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                b"aggregator" => _serde::__private::Ok(__Field::__field0),
                                b"resume" => _serde::__private::Ok(__Field::__field1),
                                b"fees" => _serde::__private::Ok(__Field::__field2),
                                b"provider_details" => {
                                    _serde::__private::Ok(__Field::__field3)
                                }
                                b"approval_contract" => {
                                    _serde::__private::Ok(__Field::__field4)
                                }
                                b"transaction_details" => {
                                    _serde::__private::Ok(__Field::__field5)
                                }
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                    }
                    impl<'de> _serde::Deserialize<'de> for __Field {
                        #[inline]
                        fn deserialize<__D>(
                            __deserializer: __D,
                        ) -> _serde::__private::Result<Self, __D::Error>
                        where
                            __D: _serde::Deserializer<'de>,
                        {
                            _serde::Deserializer::deserialize_identifier(
                                __deserializer,
                                __FieldVisitor,
                            )
                        }
                    }
                    struct __Visitor<'de> {
                        marker: _serde::__private::PhantomData<QuoteResponse>,
                        lifetime: _serde::__private::PhantomData<&'de ()>,
                    }
                    impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                        type Value = QuoteResponse;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "struct QuoteResponse",
                            )
                        }
                        #[inline]
                        fn visit_seq<__A>(
                            self,
                            mut __seq: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::SeqAccess<'de>,
                        {
                            let __field0 = match match _serde::de::SeqAccess::next_element::<
                                AggregatorDetails,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            0usize,
                                            &"struct QuoteResponse with 6 elements",
                                        ),
                                    );
                                }
                            };
                            let __field1 = match match _serde::de::SeqAccess::next_element::<
                                RouteResume,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            1usize,
                                            &"struct QuoteResponse with 6 elements",
                                        ),
                                    );
                                }
                            };
                            let __field2 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            2usize,
                                            &"struct QuoteResponse with 6 elements",
                                        ),
                                    );
                                }
                            };
                            let __field3 = match match _serde::de::SeqAccess::next_element::<
                                Vec<ProviderDetails>,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            3usize,
                                            &"struct QuoteResponse with 6 elements",
                                        ),
                                    );
                                }
                            };
                            let __field4 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            4usize,
                                            &"struct QuoteResponse with 6 elements",
                                        ),
                                    );
                                }
                            };
                            let __field5 = match match _serde::de::SeqAccess::next_element::<
                                TransactionDetails,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            5usize,
                                            &"struct QuoteResponse with 6 elements",
                                        ),
                                    );
                                }
                            };
                            _serde::__private::Ok(QuoteResponse {
                                aggregator: __field0,
                                resume: __field1,
                                fees: __field2,
                                provider_details: __field3,
                                approval_contract: __field4,
                                transaction_details: __field5,
                            })
                        }
                        #[inline]
                        fn visit_map<__A>(
                            self,
                            mut __map: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::MapAccess<'de>,
                        {
                            let mut __field0: _serde::__private::Option<
                                AggregatorDetails,
                            > = _serde::__private::None;
                            let mut __field1: _serde::__private::Option<RouteResume> = _serde::__private::None;
                            let mut __field2: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field3: _serde::__private::Option<
                                Vec<ProviderDetails>,
                            > = _serde::__private::None;
                            let mut __field4: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field5: _serde::__private::Option<
                                TransactionDetails,
                            > = _serde::__private::None;
                            while let _serde::__private::Some(__key)
                                = match _serde::de::MapAccess::next_key::<
                                    __Field,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                match __key {
                                    __Field::__field0 => {
                                        if _serde::__private::Option::is_some(&__field0) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "aggregator",
                                                ),
                                            );
                                        }
                                        __field0 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                AggregatorDetails,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field1 => {
                                        if _serde::__private::Option::is_some(&__field1) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field("resume"),
                                            );
                                        }
                                        __field1 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                RouteResume,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field2 => {
                                        if _serde::__private::Option::is_some(&__field2) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field("fees"),
                                            );
                                        }
                                        __field2 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field3 => {
                                        if _serde::__private::Option::is_some(&__field3) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "provider_details",
                                                ),
                                            );
                                        }
                                        __field3 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                Vec<ProviderDetails>,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field4 => {
                                        if _serde::__private::Option::is_some(&__field4) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "approval_contract",
                                                ),
                                            );
                                        }
                                        __field4 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field5 => {
                                        if _serde::__private::Option::is_some(&__field5) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "transaction_details",
                                                ),
                                            );
                                        }
                                        __field5 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                TransactionDetails,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    _ => {
                                        let _ = match _serde::de::MapAccess::next_value::<
                                            _serde::de::IgnoredAny,
                                        >(&mut __map) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                    }
                                }
                            }
                            let __field0 = match __field0 {
                                _serde::__private::Some(__field0) => __field0,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("aggregator") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field1 = match __field1 {
                                _serde::__private::Some(__field1) => __field1,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("resume") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field2 = match __field2 {
                                _serde::__private::Some(__field2) => __field2,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("fees") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field3 = match __field3 {
                                _serde::__private::Some(__field3) => __field3,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field(
                                        "provider_details",
                                    ) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field4 = match __field4 {
                                _serde::__private::Some(__field4) => __field4,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field(
                                        "approval_contract",
                                    ) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field5 = match __field5 {
                                _serde::__private::Some(__field5) => __field5,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field(
                                        "transaction_details",
                                    ) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            _serde::__private::Ok(QuoteResponse {
                                aggregator: __field0,
                                resume: __field1,
                                fees: __field2,
                                provider_details: __field3,
                                approval_contract: __field4,
                                transaction_details: __field5,
                            })
                        }
                    }
                    const FIELDS: &'static [&'static str] = &[
                        "aggregator",
                        "resume",
                        "fees",
                        "provider_details",
                        "approval_contract",
                        "transaction_details",
                    ];
                    _serde::Deserializer::deserialize_struct(
                        __deserializer,
                        "QuoteResponse",
                        FIELDS,
                        __Visitor {
                            marker: _serde::__private::PhantomData::<QuoteResponse>,
                            lifetime: _serde::__private::PhantomData,
                        },
                    )
                }
            }
        };
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl _serde::Serialize for QuoteResponse {
                fn serialize<__S>(
                    &self,
                    __serializer: __S,
                ) -> _serde::__private::Result<__S::Ok, __S::Error>
                where
                    __S: _serde::Serializer,
                {
                    let mut __serde_state = match _serde::Serializer::serialize_struct(
                        __serializer,
                        "QuoteResponse",
                        false as usize + 1 + 1 + 1 + 1 + 1 + 1,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "aggregator",
                        &self.aggregator,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "resume",
                        &self.resume,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "fees",
                        &self.fees,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "provider_details",
                        &self.provider_details,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "approval_contract",
                        &self.approval_contract,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "transaction_details",
                        &self.transaction_details,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    _serde::ser::SerializeStruct::end(__serde_state)
                }
            }
        };
        impl QuoteResponse {
            pub fn new() -> QuoteResponse {
                QuoteResponse {
                    aggregator: AggregatorDetails::new(),
                    resume: RouteResume::new(),
                    fees: String::new(),
                    provider_details: ::alloc::vec::Vec::new(),
                    approval_contract: String::new(),
                    transaction_details: TransactionDetails::new(),
                }
            }
            pub fn to_buffer(args: &QuoteResponse) -> Result<Vec<u8>, EncodeError> {
                serialize_quote_response(args)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn from_buffer(args: &[u8]) -> Result<QuoteResponse, DecodeError> {
                deserialize_quote_response(args)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
            pub fn write<W: Write>(
                args: &QuoteResponse,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                write_quote_response(args, writer)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn read<R: Read>(reader: &mut R) -> Result<QuoteResponse, DecodeError> {
                read_quote_response(reader)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
        }
    }
    pub use quote_response::QuoteResponse;
    pub mod aggregator_details {
        use serde::{Serialize, Deserialize};
        pub mod serialization {
            use std::convert::TryFrom;
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                ReadDecoder, Write, WriteEncoder, JSON,
            };
            use crate::AggregatorDetails;
            pub fn serialize_aggregator_details(
                args: &AggregatorDetails,
            ) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) object-type: AggregatorDetails"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_aggregator_details(args, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_aggregator_details<W: Write>(
                args: &AggregatorDetails,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.write_map_length(&5)?;
                writer.context().push("id", "String", "writing property");
                writer.write_string("id")?;
                writer.write_string(&args.id)?;
                writer.context().pop();
                writer.context().push("routeId", "Option<String>", "writing property");
                writer.write_string("routeId")?;
                writer.write_optional_string(&args.route_id)?;
                writer.context().pop();
                writer
                    .context()
                    .push("requiresCallDataQuoting", "bool", "writing property");
                writer.write_string("requiresCallDataQuoting")?;
                writer.write_bool(&args.requires_call_data_quoting)?;
                writer.context().pop();
                writer.context().push("bothQuotesInOne", "bool", "writing property");
                writer.write_string("bothQuotesInOne")?;
                writer.write_bool(&args.both_quotes_in_one)?;
                writer.context().pop();
                writer
                    .context()
                    .push("trackingId", "Option<String>", "writing property");
                writer.write_string("trackingId")?;
                writer.write_optional_string(&args.tracking_id)?;
                writer.context().pop();
                Ok(())
            }
            pub fn deserialize_aggregator_details(
                args: &[u8],
            ) -> Result<AggregatorDetails, DecodeError> {
                let mut context = Context::new();
                context
                    .description = "Deserializing object-type: AggregatorDetails"
                    .to_string();
                let mut reader = ReadDecoder::new(args, context);
                read_aggregator_details(&mut reader)
            }
            pub fn read_aggregator_details<R: Read>(
                reader: &mut R,
            ) -> Result<AggregatorDetails, DecodeError> {
                let mut num_of_fields = reader.read_map_length()?;
                let mut _id: String = String::new();
                let mut _id_set = false;
                let mut _route_id: Option<String> = None;
                let mut _requires_call_data_quoting: bool = false;
                let mut _requires_call_data_quoting_set = false;
                let mut _both_quotes_in_one: bool = false;
                let mut _both_quotes_in_one_set = false;
                let mut _tracking_id: Option<String> = None;
                while num_of_fields > 0 {
                    num_of_fields -= 1;
                    let field = reader.read_string()?;
                    match field.as_str() {
                        "id" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _id = reader.read_string()?;
                            _id_set = true;
                            reader.context().pop();
                        }
                        "routeId" => {
                            reader
                                .context()
                                .push(
                                    &field,
                                    "Option<String>",
                                    "type found, reading property",
                                );
                            _route_id = reader.read_optional_string()?;
                            reader.context().pop();
                        }
                        "requiresCallDataQuoting" => {
                            reader
                                .context()
                                .push(&field, "bool", "type found, reading property");
                            _requires_call_data_quoting = reader.read_bool()?;
                            _requires_call_data_quoting_set = true;
                            reader.context().pop();
                        }
                        "bothQuotesInOne" => {
                            reader
                                .context()
                                .push(&field, "bool", "type found, reading property");
                            _both_quotes_in_one = reader.read_bool()?;
                            _both_quotes_in_one_set = true;
                            reader.context().pop();
                        }
                        "trackingId" => {
                            reader
                                .context()
                                .push(
                                    &field,
                                    "Option<String>",
                                    "type found, reading property",
                                );
                            _tracking_id = reader.read_optional_string()?;
                            reader.context().pop();
                        }
                        err => return Err(DecodeError::UnknownFieldName(err.to_string())),
                    }
                }
                if !_id_set {
                    return Err(DecodeError::MissingField("id: String.".to_string()));
                }
                if !_requires_call_data_quoting_set {
                    return Err(
                        DecodeError::MissingField(
                            "requiresCallDataQuoting: Boolean.".to_string(),
                        ),
                    );
                }
                if !_both_quotes_in_one_set {
                    return Err(
                        DecodeError::MissingField(
                            "bothQuotesInOne: Boolean.".to_string(),
                        ),
                    );
                }
                Ok(AggregatorDetails {
                    id: _id,
                    route_id: _route_id,
                    requires_call_data_quoting: _requires_call_data_quoting,
                    both_quotes_in_one: _both_quotes_in_one,
                    tracking_id: _tracking_id,
                })
            }
        }
        use polywrap_wasm_rs::{
            BigInt, BigNumber, Map, DecodeError, EncodeError, Read, Write, JSON,
        };
        pub use serialization::{
            deserialize_aggregator_details, read_aggregator_details,
            serialize_aggregator_details, write_aggregator_details,
        };
        pub struct AggregatorDetails {
            pub id: String,
            pub route_id: Option<String>,
            pub requires_call_data_quoting: bool,
            pub both_quotes_in_one: bool,
            pub tracking_id: Option<String>,
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::clone::Clone for AggregatorDetails {
            #[inline]
            fn clone(&self) -> AggregatorDetails {
                AggregatorDetails {
                    id: ::core::clone::Clone::clone(&self.id),
                    route_id: ::core::clone::Clone::clone(&self.route_id),
                    requires_call_data_quoting: ::core::clone::Clone::clone(
                        &self.requires_call_data_quoting,
                    ),
                    both_quotes_in_one: ::core::clone::Clone::clone(
                        &self.both_quotes_in_one,
                    ),
                    tracking_id: ::core::clone::Clone::clone(&self.tracking_id),
                }
            }
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::fmt::Debug for AggregatorDetails {
            fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                ::core::fmt::Formatter::debug_struct_field5_finish(
                    f,
                    "AggregatorDetails",
                    "id",
                    &&self.id,
                    "route_id",
                    &&self.route_id,
                    "requires_call_data_quoting",
                    &&self.requires_call_data_quoting,
                    "both_quotes_in_one",
                    &&self.both_quotes_in_one,
                    "tracking_id",
                    &&self.tracking_id,
                )
            }
        }
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl<'de> _serde::Deserialize<'de> for AggregatorDetails {
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    #[allow(non_camel_case_types)]
                    enum __Field {
                        __field0,
                        __field1,
                        __field2,
                        __field3,
                        __field4,
                        __ignore,
                    }
                    struct __FieldVisitor;
                    impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                        type Value = __Field;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "field identifier",
                            )
                        }
                        fn visit_u64<__E>(
                            self,
                            __value: u64,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                0u64 => _serde::__private::Ok(__Field::__field0),
                                1u64 => _serde::__private::Ok(__Field::__field1),
                                2u64 => _serde::__private::Ok(__Field::__field2),
                                3u64 => _serde::__private::Ok(__Field::__field3),
                                4u64 => _serde::__private::Ok(__Field::__field4),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_str<__E>(
                            self,
                            __value: &str,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                "id" => _serde::__private::Ok(__Field::__field0),
                                "route_id" => _serde::__private::Ok(__Field::__field1),
                                "requires_call_data_quoting" => {
                                    _serde::__private::Ok(__Field::__field2)
                                }
                                "both_quotes_in_one" => {
                                    _serde::__private::Ok(__Field::__field3)
                                }
                                "tracking_id" => _serde::__private::Ok(__Field::__field4),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_bytes<__E>(
                            self,
                            __value: &[u8],
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                b"id" => _serde::__private::Ok(__Field::__field0),
                                b"route_id" => _serde::__private::Ok(__Field::__field1),
                                b"requires_call_data_quoting" => {
                                    _serde::__private::Ok(__Field::__field2)
                                }
                                b"both_quotes_in_one" => {
                                    _serde::__private::Ok(__Field::__field3)
                                }
                                b"tracking_id" => _serde::__private::Ok(__Field::__field4),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                    }
                    impl<'de> _serde::Deserialize<'de> for __Field {
                        #[inline]
                        fn deserialize<__D>(
                            __deserializer: __D,
                        ) -> _serde::__private::Result<Self, __D::Error>
                        where
                            __D: _serde::Deserializer<'de>,
                        {
                            _serde::Deserializer::deserialize_identifier(
                                __deserializer,
                                __FieldVisitor,
                            )
                        }
                    }
                    struct __Visitor<'de> {
                        marker: _serde::__private::PhantomData<AggregatorDetails>,
                        lifetime: _serde::__private::PhantomData<&'de ()>,
                    }
                    impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                        type Value = AggregatorDetails;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "struct AggregatorDetails",
                            )
                        }
                        #[inline]
                        fn visit_seq<__A>(
                            self,
                            mut __seq: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::SeqAccess<'de>,
                        {
                            let __field0 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            0usize,
                                            &"struct AggregatorDetails with 5 elements",
                                        ),
                                    );
                                }
                            };
                            let __field1 = match match _serde::de::SeqAccess::next_element::<
                                Option<String>,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            1usize,
                                            &"struct AggregatorDetails with 5 elements",
                                        ),
                                    );
                                }
                            };
                            let __field2 = match match _serde::de::SeqAccess::next_element::<
                                bool,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            2usize,
                                            &"struct AggregatorDetails with 5 elements",
                                        ),
                                    );
                                }
                            };
                            let __field3 = match match _serde::de::SeqAccess::next_element::<
                                bool,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            3usize,
                                            &"struct AggregatorDetails with 5 elements",
                                        ),
                                    );
                                }
                            };
                            let __field4 = match match _serde::de::SeqAccess::next_element::<
                                Option<String>,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            4usize,
                                            &"struct AggregatorDetails with 5 elements",
                                        ),
                                    );
                                }
                            };
                            _serde::__private::Ok(AggregatorDetails {
                                id: __field0,
                                route_id: __field1,
                                requires_call_data_quoting: __field2,
                                both_quotes_in_one: __field3,
                                tracking_id: __field4,
                            })
                        }
                        #[inline]
                        fn visit_map<__A>(
                            self,
                            mut __map: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::MapAccess<'de>,
                        {
                            let mut __field0: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field1: _serde::__private::Option<
                                Option<String>,
                            > = _serde::__private::None;
                            let mut __field2: _serde::__private::Option<bool> = _serde::__private::None;
                            let mut __field3: _serde::__private::Option<bool> = _serde::__private::None;
                            let mut __field4: _serde::__private::Option<
                                Option<String>,
                            > = _serde::__private::None;
                            while let _serde::__private::Some(__key)
                                = match _serde::de::MapAccess::next_key::<
                                    __Field,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                match __key {
                                    __Field::__field0 => {
                                        if _serde::__private::Option::is_some(&__field0) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field("id"),
                                            );
                                        }
                                        __field0 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field1 => {
                                        if _serde::__private::Option::is_some(&__field1) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "route_id",
                                                ),
                                            );
                                        }
                                        __field1 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                Option<String>,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field2 => {
                                        if _serde::__private::Option::is_some(&__field2) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "requires_call_data_quoting",
                                                ),
                                            );
                                        }
                                        __field2 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                bool,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field3 => {
                                        if _serde::__private::Option::is_some(&__field3) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "both_quotes_in_one",
                                                ),
                                            );
                                        }
                                        __field3 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                bool,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field4 => {
                                        if _serde::__private::Option::is_some(&__field4) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "tracking_id",
                                                ),
                                            );
                                        }
                                        __field4 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                Option<String>,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    _ => {
                                        let _ = match _serde::de::MapAccess::next_value::<
                                            _serde::de::IgnoredAny,
                                        >(&mut __map) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                    }
                                }
                            }
                            let __field0 = match __field0 {
                                _serde::__private::Some(__field0) => __field0,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("id") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field1 = match __field1 {
                                _serde::__private::Some(__field1) => __field1,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("route_id") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field2 = match __field2 {
                                _serde::__private::Some(__field2) => __field2,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field(
                                        "requires_call_data_quoting",
                                    ) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field3 = match __field3 {
                                _serde::__private::Some(__field3) => __field3,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field(
                                        "both_quotes_in_one",
                                    ) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field4 = match __field4 {
                                _serde::__private::Some(__field4) => __field4,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("tracking_id") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            _serde::__private::Ok(AggregatorDetails {
                                id: __field0,
                                route_id: __field1,
                                requires_call_data_quoting: __field2,
                                both_quotes_in_one: __field3,
                                tracking_id: __field4,
                            })
                        }
                    }
                    const FIELDS: &'static [&'static str] = &[
                        "id",
                        "route_id",
                        "requires_call_data_quoting",
                        "both_quotes_in_one",
                        "tracking_id",
                    ];
                    _serde::Deserializer::deserialize_struct(
                        __deserializer,
                        "AggregatorDetails",
                        FIELDS,
                        __Visitor {
                            marker: _serde::__private::PhantomData::<AggregatorDetails>,
                            lifetime: _serde::__private::PhantomData,
                        },
                    )
                }
            }
        };
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl _serde::Serialize for AggregatorDetails {
                fn serialize<__S>(
                    &self,
                    __serializer: __S,
                ) -> _serde::__private::Result<__S::Ok, __S::Error>
                where
                    __S: _serde::Serializer,
                {
                    let mut __serde_state = match _serde::Serializer::serialize_struct(
                        __serializer,
                        "AggregatorDetails",
                        false as usize + 1 + 1 + 1 + 1 + 1,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "id",
                        &self.id,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "route_id",
                        &self.route_id,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "requires_call_data_quoting",
                        &self.requires_call_data_quoting,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "both_quotes_in_one",
                        &self.both_quotes_in_one,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "tracking_id",
                        &self.tracking_id,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    _serde::ser::SerializeStruct::end(__serde_state)
                }
            }
        };
        impl AggregatorDetails {
            pub fn new() -> AggregatorDetails {
                AggregatorDetails {
                    id: String::new(),
                    route_id: None,
                    requires_call_data_quoting: false,
                    both_quotes_in_one: false,
                    tracking_id: None,
                }
            }
            pub fn to_buffer(args: &AggregatorDetails) -> Result<Vec<u8>, EncodeError> {
                serialize_aggregator_details(args)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn from_buffer(args: &[u8]) -> Result<AggregatorDetails, DecodeError> {
                deserialize_aggregator_details(args)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
            pub fn write<W: Write>(
                args: &AggregatorDetails,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                write_aggregator_details(args, writer)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn read<R: Read>(
                reader: &mut R,
            ) -> Result<AggregatorDetails, DecodeError> {
                read_aggregator_details(reader)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
        }
    }
    pub use aggregator_details::AggregatorDetails;
    pub mod route_resume {
        use serde::{Serialize, Deserialize};
        pub mod serialization {
            use std::convert::TryFrom;
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                ReadDecoder, Write, WriteEncoder, JSON,
            };
            use crate::RouteResume;
            pub fn serialize_route_resume(
                args: &RouteResume,
            ) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) object-type: RouteResume"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_route_resume(args, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_route_resume<W: Write>(
                args: &RouteResume,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.write_map_length(&7)?;
                writer.context().push("fromChain", "String", "writing property");
                writer.write_string("fromChain")?;
                writer.write_string(&args.from_chain)?;
                writer.context().pop();
                writer.context().push("toChain", "String", "writing property");
                writer.write_string("toChain")?;
                writer.write_string(&args.to_chain)?;
                writer.context().pop();
                writer.context().push("fromToken", "String", "writing property");
                writer.write_string("fromToken")?;
                writer.write_string(&args.from_token)?;
                writer.context().pop();
                writer.context().push("toToken", "String", "writing property");
                writer.write_string("toToken")?;
                writer.write_string(&args.to_token)?;
                writer.context().pop();
                writer.context().push("amountIn", "BigInt", "writing property");
                writer.write_string("amountIn")?;
                writer.write_bigint(&args.amount_in)?;
                writer.context().pop();
                writer.context().push("amountOut", "BigInt", "writing property");
                writer.write_string("amountOut")?;
                writer.write_bigint(&args.amount_out)?;
                writer.context().pop();
                writer.context().push("estimatedTime", "String", "writing property");
                writer.write_string("estimatedTime")?;
                writer.write_string(&args.estimated_time)?;
                writer.context().pop();
                Ok(())
            }
            pub fn deserialize_route_resume(
                args: &[u8],
            ) -> Result<RouteResume, DecodeError> {
                let mut context = Context::new();
                context
                    .description = "Deserializing object-type: RouteResume".to_string();
                let mut reader = ReadDecoder::new(args, context);
                read_route_resume(&mut reader)
            }
            pub fn read_route_resume<R: Read>(
                reader: &mut R,
            ) -> Result<RouteResume, DecodeError> {
                let mut num_of_fields = reader.read_map_length()?;
                let mut _from_chain: String = String::new();
                let mut _from_chain_set = false;
                let mut _to_chain: String = String::new();
                let mut _to_chain_set = false;
                let mut _from_token: String = String::new();
                let mut _from_token_set = false;
                let mut _to_token: String = String::new();
                let mut _to_token_set = false;
                let mut _amount_in: BigInt = BigInt::default();
                let mut _amount_in_set = false;
                let mut _amount_out: BigInt = BigInt::default();
                let mut _amount_out_set = false;
                let mut _estimated_time: String = String::new();
                let mut _estimated_time_set = false;
                while num_of_fields > 0 {
                    num_of_fields -= 1;
                    let field = reader.read_string()?;
                    match field.as_str() {
                        "fromChain" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _from_chain = reader.read_string()?;
                            _from_chain_set = true;
                            reader.context().pop();
                        }
                        "toChain" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _to_chain = reader.read_string()?;
                            _to_chain_set = true;
                            reader.context().pop();
                        }
                        "fromToken" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _from_token = reader.read_string()?;
                            _from_token_set = true;
                            reader.context().pop();
                        }
                        "toToken" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _to_token = reader.read_string()?;
                            _to_token_set = true;
                            reader.context().pop();
                        }
                        "amountIn" => {
                            reader
                                .context()
                                .push(&field, "BigInt", "type found, reading property");
                            _amount_in = reader.read_bigint()?;
                            _amount_in_set = true;
                            reader.context().pop();
                        }
                        "amountOut" => {
                            reader
                                .context()
                                .push(&field, "BigInt", "type found, reading property");
                            _amount_out = reader.read_bigint()?;
                            _amount_out_set = true;
                            reader.context().pop();
                        }
                        "estimatedTime" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _estimated_time = reader.read_string()?;
                            _estimated_time_set = true;
                            reader.context().pop();
                        }
                        err => return Err(DecodeError::UnknownFieldName(err.to_string())),
                    }
                }
                if !_from_chain_set {
                    return Err(
                        DecodeError::MissingField("fromChain: String.".to_string()),
                    );
                }
                if !_to_chain_set {
                    return Err(
                        DecodeError::MissingField("toChain: String.".to_string()),
                    );
                }
                if !_from_token_set {
                    return Err(
                        DecodeError::MissingField("fromToken: String.".to_string()),
                    );
                }
                if !_to_token_set {
                    return Err(
                        DecodeError::MissingField("toToken: String.".to_string()),
                    );
                }
                if !_amount_in_set {
                    return Err(
                        DecodeError::MissingField("amountIn: BigInt.".to_string()),
                    );
                }
                if !_amount_out_set {
                    return Err(
                        DecodeError::MissingField("amountOut: BigInt.".to_string()),
                    );
                }
                if !_estimated_time_set {
                    return Err(
                        DecodeError::MissingField("estimatedTime: String.".to_string()),
                    );
                }
                Ok(RouteResume {
                    from_chain: _from_chain,
                    to_chain: _to_chain,
                    from_token: _from_token,
                    to_token: _to_token,
                    amount_in: _amount_in,
                    amount_out: _amount_out,
                    estimated_time: _estimated_time,
                })
            }
        }
        use polywrap_wasm_rs::{
            BigInt, BigNumber, Map, DecodeError, EncodeError, Read, Write, JSON,
        };
        pub use serialization::{
            deserialize_route_resume, read_route_resume, serialize_route_resume,
            write_route_resume,
        };
        pub struct RouteResume {
            pub from_chain: String,
            pub to_chain: String,
            pub from_token: String,
            pub to_token: String,
            pub amount_in: BigInt,
            pub amount_out: BigInt,
            pub estimated_time: String,
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::clone::Clone for RouteResume {
            #[inline]
            fn clone(&self) -> RouteResume {
                RouteResume {
                    from_chain: ::core::clone::Clone::clone(&self.from_chain),
                    to_chain: ::core::clone::Clone::clone(&self.to_chain),
                    from_token: ::core::clone::Clone::clone(&self.from_token),
                    to_token: ::core::clone::Clone::clone(&self.to_token),
                    amount_in: ::core::clone::Clone::clone(&self.amount_in),
                    amount_out: ::core::clone::Clone::clone(&self.amount_out),
                    estimated_time: ::core::clone::Clone::clone(&self.estimated_time),
                }
            }
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::fmt::Debug for RouteResume {
            fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                {
                    let names: &'static _ = &[
                        "from_chain",
                        "to_chain",
                        "from_token",
                        "to_token",
                        "amount_in",
                        "amount_out",
                        "estimated_time",
                    ];
                    let values: &[&dyn ::core::fmt::Debug] = &[
                        &&self.from_chain,
                        &&self.to_chain,
                        &&self.from_token,
                        &&self.to_token,
                        &&self.amount_in,
                        &&self.amount_out,
                        &&self.estimated_time,
                    ];
                    ::core::fmt::Formatter::debug_struct_fields_finish(
                        f,
                        "RouteResume",
                        names,
                        values,
                    )
                }
            }
        }
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl<'de> _serde::Deserialize<'de> for RouteResume {
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    #[allow(non_camel_case_types)]
                    enum __Field {
                        __field0,
                        __field1,
                        __field2,
                        __field3,
                        __field4,
                        __field5,
                        __field6,
                        __ignore,
                    }
                    struct __FieldVisitor;
                    impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                        type Value = __Field;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "field identifier",
                            )
                        }
                        fn visit_u64<__E>(
                            self,
                            __value: u64,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                0u64 => _serde::__private::Ok(__Field::__field0),
                                1u64 => _serde::__private::Ok(__Field::__field1),
                                2u64 => _serde::__private::Ok(__Field::__field2),
                                3u64 => _serde::__private::Ok(__Field::__field3),
                                4u64 => _serde::__private::Ok(__Field::__field4),
                                5u64 => _serde::__private::Ok(__Field::__field5),
                                6u64 => _serde::__private::Ok(__Field::__field6),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_str<__E>(
                            self,
                            __value: &str,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                "from_chain" => _serde::__private::Ok(__Field::__field0),
                                "to_chain" => _serde::__private::Ok(__Field::__field1),
                                "from_token" => _serde::__private::Ok(__Field::__field2),
                                "to_token" => _serde::__private::Ok(__Field::__field3),
                                "amount_in" => _serde::__private::Ok(__Field::__field4),
                                "amount_out" => _serde::__private::Ok(__Field::__field5),
                                "estimated_time" => _serde::__private::Ok(__Field::__field6),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_bytes<__E>(
                            self,
                            __value: &[u8],
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                b"from_chain" => _serde::__private::Ok(__Field::__field0),
                                b"to_chain" => _serde::__private::Ok(__Field::__field1),
                                b"from_token" => _serde::__private::Ok(__Field::__field2),
                                b"to_token" => _serde::__private::Ok(__Field::__field3),
                                b"amount_in" => _serde::__private::Ok(__Field::__field4),
                                b"amount_out" => _serde::__private::Ok(__Field::__field5),
                                b"estimated_time" => {
                                    _serde::__private::Ok(__Field::__field6)
                                }
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                    }
                    impl<'de> _serde::Deserialize<'de> for __Field {
                        #[inline]
                        fn deserialize<__D>(
                            __deserializer: __D,
                        ) -> _serde::__private::Result<Self, __D::Error>
                        where
                            __D: _serde::Deserializer<'de>,
                        {
                            _serde::Deserializer::deserialize_identifier(
                                __deserializer,
                                __FieldVisitor,
                            )
                        }
                    }
                    struct __Visitor<'de> {
                        marker: _serde::__private::PhantomData<RouteResume>,
                        lifetime: _serde::__private::PhantomData<&'de ()>,
                    }
                    impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                        type Value = RouteResume;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "struct RouteResume",
                            )
                        }
                        #[inline]
                        fn visit_seq<__A>(
                            self,
                            mut __seq: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::SeqAccess<'de>,
                        {
                            let __field0 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            0usize,
                                            &"struct RouteResume with 7 elements",
                                        ),
                                    );
                                }
                            };
                            let __field1 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            1usize,
                                            &"struct RouteResume with 7 elements",
                                        ),
                                    );
                                }
                            };
                            let __field2 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            2usize,
                                            &"struct RouteResume with 7 elements",
                                        ),
                                    );
                                }
                            };
                            let __field3 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            3usize,
                                            &"struct RouteResume with 7 elements",
                                        ),
                                    );
                                }
                            };
                            let __field4 = match match _serde::de::SeqAccess::next_element::<
                                BigInt,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            4usize,
                                            &"struct RouteResume with 7 elements",
                                        ),
                                    );
                                }
                            };
                            let __field5 = match match _serde::de::SeqAccess::next_element::<
                                BigInt,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            5usize,
                                            &"struct RouteResume with 7 elements",
                                        ),
                                    );
                                }
                            };
                            let __field6 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            6usize,
                                            &"struct RouteResume with 7 elements",
                                        ),
                                    );
                                }
                            };
                            _serde::__private::Ok(RouteResume {
                                from_chain: __field0,
                                to_chain: __field1,
                                from_token: __field2,
                                to_token: __field3,
                                amount_in: __field4,
                                amount_out: __field5,
                                estimated_time: __field6,
                            })
                        }
                        #[inline]
                        fn visit_map<__A>(
                            self,
                            mut __map: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::MapAccess<'de>,
                        {
                            let mut __field0: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field1: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field2: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field3: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field4: _serde::__private::Option<BigInt> = _serde::__private::None;
                            let mut __field5: _serde::__private::Option<BigInt> = _serde::__private::None;
                            let mut __field6: _serde::__private::Option<String> = _serde::__private::None;
                            while let _serde::__private::Some(__key)
                                = match _serde::de::MapAccess::next_key::<
                                    __Field,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                match __key {
                                    __Field::__field0 => {
                                        if _serde::__private::Option::is_some(&__field0) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "from_chain",
                                                ),
                                            );
                                        }
                                        __field0 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field1 => {
                                        if _serde::__private::Option::is_some(&__field1) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "to_chain",
                                                ),
                                            );
                                        }
                                        __field1 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field2 => {
                                        if _serde::__private::Option::is_some(&__field2) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "from_token",
                                                ),
                                            );
                                        }
                                        __field2 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field3 => {
                                        if _serde::__private::Option::is_some(&__field3) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "to_token",
                                                ),
                                            );
                                        }
                                        __field3 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field4 => {
                                        if _serde::__private::Option::is_some(&__field4) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "amount_in",
                                                ),
                                            );
                                        }
                                        __field4 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                BigInt,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field5 => {
                                        if _serde::__private::Option::is_some(&__field5) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "amount_out",
                                                ),
                                            );
                                        }
                                        __field5 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                BigInt,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field6 => {
                                        if _serde::__private::Option::is_some(&__field6) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "estimated_time",
                                                ),
                                            );
                                        }
                                        __field6 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    _ => {
                                        let _ = match _serde::de::MapAccess::next_value::<
                                            _serde::de::IgnoredAny,
                                        >(&mut __map) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                    }
                                }
                            }
                            let __field0 = match __field0 {
                                _serde::__private::Some(__field0) => __field0,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("from_chain") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field1 = match __field1 {
                                _serde::__private::Some(__field1) => __field1,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("to_chain") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field2 = match __field2 {
                                _serde::__private::Some(__field2) => __field2,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("from_token") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field3 = match __field3 {
                                _serde::__private::Some(__field3) => __field3,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("to_token") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field4 = match __field4 {
                                _serde::__private::Some(__field4) => __field4,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("amount_in") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field5 = match __field5 {
                                _serde::__private::Some(__field5) => __field5,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("amount_out") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field6 = match __field6 {
                                _serde::__private::Some(__field6) => __field6,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field(
                                        "estimated_time",
                                    ) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            _serde::__private::Ok(RouteResume {
                                from_chain: __field0,
                                to_chain: __field1,
                                from_token: __field2,
                                to_token: __field3,
                                amount_in: __field4,
                                amount_out: __field5,
                                estimated_time: __field6,
                            })
                        }
                    }
                    const FIELDS: &'static [&'static str] = &[
                        "from_chain",
                        "to_chain",
                        "from_token",
                        "to_token",
                        "amount_in",
                        "amount_out",
                        "estimated_time",
                    ];
                    _serde::Deserializer::deserialize_struct(
                        __deserializer,
                        "RouteResume",
                        FIELDS,
                        __Visitor {
                            marker: _serde::__private::PhantomData::<RouteResume>,
                            lifetime: _serde::__private::PhantomData,
                        },
                    )
                }
            }
        };
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl _serde::Serialize for RouteResume {
                fn serialize<__S>(
                    &self,
                    __serializer: __S,
                ) -> _serde::__private::Result<__S::Ok, __S::Error>
                where
                    __S: _serde::Serializer,
                {
                    let mut __serde_state = match _serde::Serializer::serialize_struct(
                        __serializer,
                        "RouteResume",
                        false as usize + 1 + 1 + 1 + 1 + 1 + 1 + 1,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "from_chain",
                        &self.from_chain,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "to_chain",
                        &self.to_chain,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "from_token",
                        &self.from_token,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "to_token",
                        &self.to_token,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "amount_in",
                        &self.amount_in,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "amount_out",
                        &self.amount_out,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "estimated_time",
                        &self.estimated_time,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    _serde::ser::SerializeStruct::end(__serde_state)
                }
            }
        };
        impl RouteResume {
            pub fn new() -> RouteResume {
                RouteResume {
                    from_chain: String::new(),
                    to_chain: String::new(),
                    from_token: String::new(),
                    to_token: String::new(),
                    amount_in: BigInt::default(),
                    amount_out: BigInt::default(),
                    estimated_time: String::new(),
                }
            }
            pub fn to_buffer(args: &RouteResume) -> Result<Vec<u8>, EncodeError> {
                serialize_route_resume(args)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn from_buffer(args: &[u8]) -> Result<RouteResume, DecodeError> {
                deserialize_route_resume(args)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
            pub fn write<W: Write>(
                args: &RouteResume,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                write_route_resume(args, writer)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn read<R: Read>(reader: &mut R) -> Result<RouteResume, DecodeError> {
                read_route_resume(reader)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
        }
    }
    pub use route_resume::RouteResume;
    pub mod transaction_details {
        use serde::{Serialize, Deserialize};
        pub mod serialization {
            use std::convert::TryFrom;
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                ReadDecoder, Write, WriteEncoder, JSON,
            };
            use crate::TransactionDetails;
            pub fn serialize_transaction_details(
                args: &TransactionDetails,
            ) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) object-type: TransactionDetails"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_transaction_details(args, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_transaction_details<W: Write>(
                args: &TransactionDetails,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.write_map_length(&4)?;
                writer.context().push("to", "String", "writing property");
                writer.write_string("to")?;
                writer.write_string(&args.to)?;
                writer.context().pop();
                writer.context().push("callData", "String", "writing property");
                writer.write_string("callData")?;
                writer.write_string(&args.call_data)?;
                writer.context().pop();
                writer.context().push("value", "String", "writing property");
                writer.write_string("value")?;
                writer.write_string(&args.value)?;
                writer.context().pop();
                writer.context().push("gasLimit", "String", "writing property");
                writer.write_string("gasLimit")?;
                writer.write_string(&args.gas_limit)?;
                writer.context().pop();
                Ok(())
            }
            pub fn deserialize_transaction_details(
                args: &[u8],
            ) -> Result<TransactionDetails, DecodeError> {
                let mut context = Context::new();
                context
                    .description = "Deserializing object-type: TransactionDetails"
                    .to_string();
                let mut reader = ReadDecoder::new(args, context);
                read_transaction_details(&mut reader)
            }
            pub fn read_transaction_details<R: Read>(
                reader: &mut R,
            ) -> Result<TransactionDetails, DecodeError> {
                let mut num_of_fields = reader.read_map_length()?;
                let mut _to: String = String::new();
                let mut _to_set = false;
                let mut _call_data: String = String::new();
                let mut _call_data_set = false;
                let mut _value: String = String::new();
                let mut _value_set = false;
                let mut _gas_limit: String = String::new();
                let mut _gas_limit_set = false;
                while num_of_fields > 0 {
                    num_of_fields -= 1;
                    let field = reader.read_string()?;
                    match field.as_str() {
                        "to" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _to = reader.read_string()?;
                            _to_set = true;
                            reader.context().pop();
                        }
                        "callData" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _call_data = reader.read_string()?;
                            _call_data_set = true;
                            reader.context().pop();
                        }
                        "value" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _value = reader.read_string()?;
                            _value_set = true;
                            reader.context().pop();
                        }
                        "gasLimit" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _gas_limit = reader.read_string()?;
                            _gas_limit_set = true;
                            reader.context().pop();
                        }
                        err => return Err(DecodeError::UnknownFieldName(err.to_string())),
                    }
                }
                if !_to_set {
                    return Err(DecodeError::MissingField("to: String.".to_string()));
                }
                if !_call_data_set {
                    return Err(
                        DecodeError::MissingField("callData: String.".to_string()),
                    );
                }
                if !_value_set {
                    return Err(DecodeError::MissingField("value: String.".to_string()));
                }
                if !_gas_limit_set {
                    return Err(
                        DecodeError::MissingField("gasLimit: String.".to_string()),
                    );
                }
                Ok(TransactionDetails {
                    to: _to,
                    call_data: _call_data,
                    value: _value,
                    gas_limit: _gas_limit,
                })
            }
        }
        use polywrap_wasm_rs::{
            BigInt, BigNumber, Map, DecodeError, EncodeError, Read, Write, JSON,
        };
        pub use serialization::{
            deserialize_transaction_details, read_transaction_details,
            serialize_transaction_details, write_transaction_details,
        };
        pub struct TransactionDetails {
            pub to: String,
            pub call_data: String,
            pub value: String,
            pub gas_limit: String,
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::clone::Clone for TransactionDetails {
            #[inline]
            fn clone(&self) -> TransactionDetails {
                TransactionDetails {
                    to: ::core::clone::Clone::clone(&self.to),
                    call_data: ::core::clone::Clone::clone(&self.call_data),
                    value: ::core::clone::Clone::clone(&self.value),
                    gas_limit: ::core::clone::Clone::clone(&self.gas_limit),
                }
            }
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::fmt::Debug for TransactionDetails {
            fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                ::core::fmt::Formatter::debug_struct_field4_finish(
                    f,
                    "TransactionDetails",
                    "to",
                    &&self.to,
                    "call_data",
                    &&self.call_data,
                    "value",
                    &&self.value,
                    "gas_limit",
                    &&self.gas_limit,
                )
            }
        }
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl<'de> _serde::Deserialize<'de> for TransactionDetails {
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    #[allow(non_camel_case_types)]
                    enum __Field {
                        __field0,
                        __field1,
                        __field2,
                        __field3,
                        __ignore,
                    }
                    struct __FieldVisitor;
                    impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                        type Value = __Field;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "field identifier",
                            )
                        }
                        fn visit_u64<__E>(
                            self,
                            __value: u64,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                0u64 => _serde::__private::Ok(__Field::__field0),
                                1u64 => _serde::__private::Ok(__Field::__field1),
                                2u64 => _serde::__private::Ok(__Field::__field2),
                                3u64 => _serde::__private::Ok(__Field::__field3),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_str<__E>(
                            self,
                            __value: &str,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                "to" => _serde::__private::Ok(__Field::__field0),
                                "call_data" => _serde::__private::Ok(__Field::__field1),
                                "value" => _serde::__private::Ok(__Field::__field2),
                                "gas_limit" => _serde::__private::Ok(__Field::__field3),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_bytes<__E>(
                            self,
                            __value: &[u8],
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                b"to" => _serde::__private::Ok(__Field::__field0),
                                b"call_data" => _serde::__private::Ok(__Field::__field1),
                                b"value" => _serde::__private::Ok(__Field::__field2),
                                b"gas_limit" => _serde::__private::Ok(__Field::__field3),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                    }
                    impl<'de> _serde::Deserialize<'de> for __Field {
                        #[inline]
                        fn deserialize<__D>(
                            __deserializer: __D,
                        ) -> _serde::__private::Result<Self, __D::Error>
                        where
                            __D: _serde::Deserializer<'de>,
                        {
                            _serde::Deserializer::deserialize_identifier(
                                __deserializer,
                                __FieldVisitor,
                            )
                        }
                    }
                    struct __Visitor<'de> {
                        marker: _serde::__private::PhantomData<TransactionDetails>,
                        lifetime: _serde::__private::PhantomData<&'de ()>,
                    }
                    impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                        type Value = TransactionDetails;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "struct TransactionDetails",
                            )
                        }
                        #[inline]
                        fn visit_seq<__A>(
                            self,
                            mut __seq: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::SeqAccess<'de>,
                        {
                            let __field0 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            0usize,
                                            &"struct TransactionDetails with 4 elements",
                                        ),
                                    );
                                }
                            };
                            let __field1 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            1usize,
                                            &"struct TransactionDetails with 4 elements",
                                        ),
                                    );
                                }
                            };
                            let __field2 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            2usize,
                                            &"struct TransactionDetails with 4 elements",
                                        ),
                                    );
                                }
                            };
                            let __field3 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            3usize,
                                            &"struct TransactionDetails with 4 elements",
                                        ),
                                    );
                                }
                            };
                            _serde::__private::Ok(TransactionDetails {
                                to: __field0,
                                call_data: __field1,
                                value: __field2,
                                gas_limit: __field3,
                            })
                        }
                        #[inline]
                        fn visit_map<__A>(
                            self,
                            mut __map: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::MapAccess<'de>,
                        {
                            let mut __field0: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field1: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field2: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field3: _serde::__private::Option<String> = _serde::__private::None;
                            while let _serde::__private::Some(__key)
                                = match _serde::de::MapAccess::next_key::<
                                    __Field,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                match __key {
                                    __Field::__field0 => {
                                        if _serde::__private::Option::is_some(&__field0) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field("to"),
                                            );
                                        }
                                        __field0 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field1 => {
                                        if _serde::__private::Option::is_some(&__field1) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "call_data",
                                                ),
                                            );
                                        }
                                        __field1 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field2 => {
                                        if _serde::__private::Option::is_some(&__field2) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field("value"),
                                            );
                                        }
                                        __field2 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field3 => {
                                        if _serde::__private::Option::is_some(&__field3) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "gas_limit",
                                                ),
                                            );
                                        }
                                        __field3 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    _ => {
                                        let _ = match _serde::de::MapAccess::next_value::<
                                            _serde::de::IgnoredAny,
                                        >(&mut __map) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                    }
                                }
                            }
                            let __field0 = match __field0 {
                                _serde::__private::Some(__field0) => __field0,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("to") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field1 = match __field1 {
                                _serde::__private::Some(__field1) => __field1,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("call_data") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field2 = match __field2 {
                                _serde::__private::Some(__field2) => __field2,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("value") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field3 = match __field3 {
                                _serde::__private::Some(__field3) => __field3,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("gas_limit") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            _serde::__private::Ok(TransactionDetails {
                                to: __field0,
                                call_data: __field1,
                                value: __field2,
                                gas_limit: __field3,
                            })
                        }
                    }
                    const FIELDS: &'static [&'static str] = &[
                        "to",
                        "call_data",
                        "value",
                        "gas_limit",
                    ];
                    _serde::Deserializer::deserialize_struct(
                        __deserializer,
                        "TransactionDetails",
                        FIELDS,
                        __Visitor {
                            marker: _serde::__private::PhantomData::<TransactionDetails>,
                            lifetime: _serde::__private::PhantomData,
                        },
                    )
                }
            }
        };
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl _serde::Serialize for TransactionDetails {
                fn serialize<__S>(
                    &self,
                    __serializer: __S,
                ) -> _serde::__private::Result<__S::Ok, __S::Error>
                where
                    __S: _serde::Serializer,
                {
                    let mut __serde_state = match _serde::Serializer::serialize_struct(
                        __serializer,
                        "TransactionDetails",
                        false as usize + 1 + 1 + 1 + 1,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "to",
                        &self.to,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "call_data",
                        &self.call_data,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "value",
                        &self.value,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "gas_limit",
                        &self.gas_limit,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    _serde::ser::SerializeStruct::end(__serde_state)
                }
            }
        };
        impl TransactionDetails {
            pub fn new() -> TransactionDetails {
                TransactionDetails {
                    to: String::new(),
                    call_data: String::new(),
                    value: String::new(),
                    gas_limit: String::new(),
                }
            }
            pub fn to_buffer(args: &TransactionDetails) -> Result<Vec<u8>, EncodeError> {
                serialize_transaction_details(args)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn from_buffer(args: &[u8]) -> Result<TransactionDetails, DecodeError> {
                deserialize_transaction_details(args)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
            pub fn write<W: Write>(
                args: &TransactionDetails,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                write_transaction_details(args, writer)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn read<R: Read>(
                reader: &mut R,
            ) -> Result<TransactionDetails, DecodeError> {
                read_transaction_details(reader)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
        }
    }
    pub use transaction_details::TransactionDetails;
    pub mod provider_details {
        use serde::{Serialize, Deserialize};
        pub mod serialization {
            use std::convert::TryFrom;
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                ReadDecoder, Write, WriteEncoder, JSON,
            };
            use crate::ProviderDetails;
            pub fn serialize_provider_details(
                args: &ProviderDetails,
            ) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) object-type: ProviderDetails"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_provider_details(args, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_provider_details<W: Write>(
                args: &ProviderDetails,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.write_map_length(&2)?;
                writer.context().push("name", "String", "writing property");
                writer.write_string("name")?;
                writer.write_string(&args.name)?;
                writer.context().pop();
                writer.context().push("logo", "String", "writing property");
                writer.write_string("logo")?;
                writer.write_string(&args.logo)?;
                writer.context().pop();
                Ok(())
            }
            pub fn deserialize_provider_details(
                args: &[u8],
            ) -> Result<ProviderDetails, DecodeError> {
                let mut context = Context::new();
                context
                    .description = "Deserializing object-type: ProviderDetails"
                    .to_string();
                let mut reader = ReadDecoder::new(args, context);
                read_provider_details(&mut reader)
            }
            pub fn read_provider_details<R: Read>(
                reader: &mut R,
            ) -> Result<ProviderDetails, DecodeError> {
                let mut num_of_fields = reader.read_map_length()?;
                let mut _name: String = String::new();
                let mut _name_set = false;
                let mut _logo: String = String::new();
                let mut _logo_set = false;
                while num_of_fields > 0 {
                    num_of_fields -= 1;
                    let field = reader.read_string()?;
                    match field.as_str() {
                        "name" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _name = reader.read_string()?;
                            _name_set = true;
                            reader.context().pop();
                        }
                        "logo" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _logo = reader.read_string()?;
                            _logo_set = true;
                            reader.context().pop();
                        }
                        err => return Err(DecodeError::UnknownFieldName(err.to_string())),
                    }
                }
                if !_name_set {
                    return Err(DecodeError::MissingField("name: String.".to_string()));
                }
                if !_logo_set {
                    return Err(DecodeError::MissingField("logo: String.".to_string()));
                }
                Ok(ProviderDetails {
                    name: _name,
                    logo: _logo,
                })
            }
        }
        use polywrap_wasm_rs::{
            BigInt, BigNumber, Map, DecodeError, EncodeError, Read, Write, JSON,
        };
        pub use serialization::{
            deserialize_provider_details, read_provider_details,
            serialize_provider_details, write_provider_details,
        };
        pub struct ProviderDetails {
            pub name: String,
            pub logo: String,
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::clone::Clone for ProviderDetails {
            #[inline]
            fn clone(&self) -> ProviderDetails {
                ProviderDetails {
                    name: ::core::clone::Clone::clone(&self.name),
                    logo: ::core::clone::Clone::clone(&self.logo),
                }
            }
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::fmt::Debug for ProviderDetails {
            fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                ::core::fmt::Formatter::debug_struct_field2_finish(
                    f,
                    "ProviderDetails",
                    "name",
                    &&self.name,
                    "logo",
                    &&self.logo,
                )
            }
        }
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl<'de> _serde::Deserialize<'de> for ProviderDetails {
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    #[allow(non_camel_case_types)]
                    enum __Field {
                        __field0,
                        __field1,
                        __ignore,
                    }
                    struct __FieldVisitor;
                    impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                        type Value = __Field;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "field identifier",
                            )
                        }
                        fn visit_u64<__E>(
                            self,
                            __value: u64,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                0u64 => _serde::__private::Ok(__Field::__field0),
                                1u64 => _serde::__private::Ok(__Field::__field1),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_str<__E>(
                            self,
                            __value: &str,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                "name" => _serde::__private::Ok(__Field::__field0),
                                "logo" => _serde::__private::Ok(__Field::__field1),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_bytes<__E>(
                            self,
                            __value: &[u8],
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                b"name" => _serde::__private::Ok(__Field::__field0),
                                b"logo" => _serde::__private::Ok(__Field::__field1),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                    }
                    impl<'de> _serde::Deserialize<'de> for __Field {
                        #[inline]
                        fn deserialize<__D>(
                            __deserializer: __D,
                        ) -> _serde::__private::Result<Self, __D::Error>
                        where
                            __D: _serde::Deserializer<'de>,
                        {
                            _serde::Deserializer::deserialize_identifier(
                                __deserializer,
                                __FieldVisitor,
                            )
                        }
                    }
                    struct __Visitor<'de> {
                        marker: _serde::__private::PhantomData<ProviderDetails>,
                        lifetime: _serde::__private::PhantomData<&'de ()>,
                    }
                    impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                        type Value = ProviderDetails;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "struct ProviderDetails",
                            )
                        }
                        #[inline]
                        fn visit_seq<__A>(
                            self,
                            mut __seq: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::SeqAccess<'de>,
                        {
                            let __field0 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            0usize,
                                            &"struct ProviderDetails with 2 elements",
                                        ),
                                    );
                                }
                            };
                            let __field1 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            1usize,
                                            &"struct ProviderDetails with 2 elements",
                                        ),
                                    );
                                }
                            };
                            _serde::__private::Ok(ProviderDetails {
                                name: __field0,
                                logo: __field1,
                            })
                        }
                        #[inline]
                        fn visit_map<__A>(
                            self,
                            mut __map: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::MapAccess<'de>,
                        {
                            let mut __field0: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field1: _serde::__private::Option<String> = _serde::__private::None;
                            while let _serde::__private::Some(__key)
                                = match _serde::de::MapAccess::next_key::<
                                    __Field,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                match __key {
                                    __Field::__field0 => {
                                        if _serde::__private::Option::is_some(&__field0) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field("name"),
                                            );
                                        }
                                        __field0 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field1 => {
                                        if _serde::__private::Option::is_some(&__field1) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field("logo"),
                                            );
                                        }
                                        __field1 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    _ => {
                                        let _ = match _serde::de::MapAccess::next_value::<
                                            _serde::de::IgnoredAny,
                                        >(&mut __map) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                    }
                                }
                            }
                            let __field0 = match __field0 {
                                _serde::__private::Some(__field0) => __field0,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("name") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field1 = match __field1 {
                                _serde::__private::Some(__field1) => __field1,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("logo") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            _serde::__private::Ok(ProviderDetails {
                                name: __field0,
                                logo: __field1,
                            })
                        }
                    }
                    const FIELDS: &'static [&'static str] = &["name", "logo"];
                    _serde::Deserializer::deserialize_struct(
                        __deserializer,
                        "ProviderDetails",
                        FIELDS,
                        __Visitor {
                            marker: _serde::__private::PhantomData::<ProviderDetails>,
                            lifetime: _serde::__private::PhantomData,
                        },
                    )
                }
            }
        };
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl _serde::Serialize for ProviderDetails {
                fn serialize<__S>(
                    &self,
                    __serializer: __S,
                ) -> _serde::__private::Result<__S::Ok, __S::Error>
                where
                    __S: _serde::Serializer,
                {
                    let mut __serde_state = match _serde::Serializer::serialize_struct(
                        __serializer,
                        "ProviderDetails",
                        false as usize + 1 + 1,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "name",
                        &self.name,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "logo",
                        &self.logo,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    _serde::ser::SerializeStruct::end(__serde_state)
                }
            }
        };
        impl ProviderDetails {
            pub fn new() -> ProviderDetails {
                ProviderDetails {
                    name: String::new(),
                    logo: String::new(),
                }
            }
            pub fn to_buffer(args: &ProviderDetails) -> Result<Vec<u8>, EncodeError> {
                serialize_provider_details(args)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn from_buffer(args: &[u8]) -> Result<ProviderDetails, DecodeError> {
                deserialize_provider_details(args)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
            pub fn write<W: Write>(
                args: &ProviderDetails,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                write_provider_details(args, writer)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn read<R: Read>(
                reader: &mut R,
            ) -> Result<ProviderDetails, DecodeError> {
                read_provider_details(reader)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
        }
    }
    pub use provider_details::ProviderDetails;
    pub mod token {
        use serde::{Serialize, Deserialize};
        pub mod serialization {
            use std::convert::TryFrom;
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                ReadDecoder, Write, WriteEncoder, JSON,
            };
            use crate::Token;
            pub fn serialize_token(args: &Token) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) object-type: Token"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_token(args, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_token<W: Write>(
                args: &Token,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.write_map_length(&5)?;
                writer.context().push("chainId", "String", "writing property");
                writer.write_string("chainId")?;
                writer.write_string(&args.chain_id)?;
                writer.context().pop();
                writer.context().push("name", "String", "writing property");
                writer.write_string("name")?;
                writer.write_string(&args.name)?;
                writer.context().pop();
                writer.context().push("address", "String", "writing property");
                writer.write_string("address")?;
                writer.write_string(&args.address)?;
                writer.context().pop();
                writer.context().push("decimals", "i32", "writing property");
                writer.write_string("decimals")?;
                writer.write_i32(&args.decimals)?;
                writer.context().pop();
                writer.context().push("symbol", "String", "writing property");
                writer.write_string("symbol")?;
                writer.write_string(&args.symbol)?;
                writer.context().pop();
                Ok(())
            }
            pub fn deserialize_token(args: &[u8]) -> Result<Token, DecodeError> {
                let mut context = Context::new();
                context.description = "Deserializing object-type: Token".to_string();
                let mut reader = ReadDecoder::new(args, context);
                read_token(&mut reader)
            }
            pub fn read_token<R: Read>(reader: &mut R) -> Result<Token, DecodeError> {
                let mut num_of_fields = reader.read_map_length()?;
                let mut _chain_id: String = String::new();
                let mut _chain_id_set = false;
                let mut _name: String = String::new();
                let mut _name_set = false;
                let mut _address: String = String::new();
                let mut _address_set = false;
                let mut _decimals: i32 = 0;
                let mut _decimals_set = false;
                let mut _symbol: String = String::new();
                let mut _symbol_set = false;
                while num_of_fields > 0 {
                    num_of_fields -= 1;
                    let field = reader.read_string()?;
                    match field.as_str() {
                        "chainId" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _chain_id = reader.read_string()?;
                            _chain_id_set = true;
                            reader.context().pop();
                        }
                        "name" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _name = reader.read_string()?;
                            _name_set = true;
                            reader.context().pop();
                        }
                        "address" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _address = reader.read_string()?;
                            _address_set = true;
                            reader.context().pop();
                        }
                        "decimals" => {
                            reader
                                .context()
                                .push(&field, "i32", "type found, reading property");
                            _decimals = reader.read_i32()?;
                            _decimals_set = true;
                            reader.context().pop();
                        }
                        "symbol" => {
                            reader
                                .context()
                                .push(&field, "String", "type found, reading property");
                            _symbol = reader.read_string()?;
                            _symbol_set = true;
                            reader.context().pop();
                        }
                        err => return Err(DecodeError::UnknownFieldName(err.to_string())),
                    }
                }
                if !_chain_id_set {
                    return Err(
                        DecodeError::MissingField("chainId: String.".to_string()),
                    );
                }
                if !_name_set {
                    return Err(DecodeError::MissingField("name: String.".to_string()));
                }
                if !_address_set {
                    return Err(
                        DecodeError::MissingField("address: String.".to_string()),
                    );
                }
                if !_decimals_set {
                    return Err(DecodeError::MissingField("decimals: Int.".to_string()));
                }
                if !_symbol_set {
                    return Err(DecodeError::MissingField("symbol: String.".to_string()));
                }
                Ok(Token {
                    chain_id: _chain_id,
                    name: _name,
                    address: _address,
                    decimals: _decimals,
                    symbol: _symbol,
                })
            }
        }
        use polywrap_wasm_rs::{
            BigInt, BigNumber, Map, DecodeError, EncodeError, Read, Write, JSON,
        };
        pub use serialization::{
            deserialize_token, read_token, serialize_token, write_token,
        };
        pub struct Token {
            pub chain_id: String,
            pub name: String,
            pub address: String,
            pub decimals: i32,
            pub symbol: String,
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::clone::Clone for Token {
            #[inline]
            fn clone(&self) -> Token {
                Token {
                    chain_id: ::core::clone::Clone::clone(&self.chain_id),
                    name: ::core::clone::Clone::clone(&self.name),
                    address: ::core::clone::Clone::clone(&self.address),
                    decimals: ::core::clone::Clone::clone(&self.decimals),
                    symbol: ::core::clone::Clone::clone(&self.symbol),
                }
            }
        }
        #[automatically_derived]
        #[allow(unused_qualifications)]
        impl ::core::fmt::Debug for Token {
            fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                ::core::fmt::Formatter::debug_struct_field5_finish(
                    f,
                    "Token",
                    "chain_id",
                    &&self.chain_id,
                    "name",
                    &&self.name,
                    "address",
                    &&self.address,
                    "decimals",
                    &&self.decimals,
                    "symbol",
                    &&self.symbol,
                )
            }
        }
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl<'de> _serde::Deserialize<'de> for Token {
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    #[allow(non_camel_case_types)]
                    enum __Field {
                        __field0,
                        __field1,
                        __field2,
                        __field3,
                        __field4,
                        __ignore,
                    }
                    struct __FieldVisitor;
                    impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                        type Value = __Field;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "field identifier",
                            )
                        }
                        fn visit_u64<__E>(
                            self,
                            __value: u64,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                0u64 => _serde::__private::Ok(__Field::__field0),
                                1u64 => _serde::__private::Ok(__Field::__field1),
                                2u64 => _serde::__private::Ok(__Field::__field2),
                                3u64 => _serde::__private::Ok(__Field::__field3),
                                4u64 => _serde::__private::Ok(__Field::__field4),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_str<__E>(
                            self,
                            __value: &str,
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                "chain_id" => _serde::__private::Ok(__Field::__field0),
                                "name" => _serde::__private::Ok(__Field::__field1),
                                "address" => _serde::__private::Ok(__Field::__field2),
                                "decimals" => _serde::__private::Ok(__Field::__field3),
                                "symbol" => _serde::__private::Ok(__Field::__field4),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                        fn visit_bytes<__E>(
                            self,
                            __value: &[u8],
                        ) -> _serde::__private::Result<Self::Value, __E>
                        where
                            __E: _serde::de::Error,
                        {
                            match __value {
                                b"chain_id" => _serde::__private::Ok(__Field::__field0),
                                b"name" => _serde::__private::Ok(__Field::__field1),
                                b"address" => _serde::__private::Ok(__Field::__field2),
                                b"decimals" => _serde::__private::Ok(__Field::__field3),
                                b"symbol" => _serde::__private::Ok(__Field::__field4),
                                _ => _serde::__private::Ok(__Field::__ignore),
                            }
                        }
                    }
                    impl<'de> _serde::Deserialize<'de> for __Field {
                        #[inline]
                        fn deserialize<__D>(
                            __deserializer: __D,
                        ) -> _serde::__private::Result<Self, __D::Error>
                        where
                            __D: _serde::Deserializer<'de>,
                        {
                            _serde::Deserializer::deserialize_identifier(
                                __deserializer,
                                __FieldVisitor,
                            )
                        }
                    }
                    struct __Visitor<'de> {
                        marker: _serde::__private::PhantomData<Token>,
                        lifetime: _serde::__private::PhantomData<&'de ()>,
                    }
                    impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                        type Value = Token;
                        fn expecting(
                            &self,
                            __formatter: &mut _serde::__private::Formatter,
                        ) -> _serde::__private::fmt::Result {
                            _serde::__private::Formatter::write_str(
                                __formatter,
                                "struct Token",
                            )
                        }
                        #[inline]
                        fn visit_seq<__A>(
                            self,
                            mut __seq: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::SeqAccess<'de>,
                        {
                            let __field0 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            0usize,
                                            &"struct Token with 5 elements",
                                        ),
                                    );
                                }
                            };
                            let __field1 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            1usize,
                                            &"struct Token with 5 elements",
                                        ),
                                    );
                                }
                            };
                            let __field2 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            2usize,
                                            &"struct Token with 5 elements",
                                        ),
                                    );
                                }
                            };
                            let __field3 = match match _serde::de::SeqAccess::next_element::<
                                i32,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            3usize,
                                            &"struct Token with 5 elements",
                                        ),
                                    );
                                }
                            };
                            let __field4 = match match _serde::de::SeqAccess::next_element::<
                                String,
                            >(&mut __seq) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            } {
                                _serde::__private::Some(__value) => __value,
                                _serde::__private::None => {
                                    return _serde::__private::Err(
                                        _serde::de::Error::invalid_length(
                                            4usize,
                                            &"struct Token with 5 elements",
                                        ),
                                    );
                                }
                            };
                            _serde::__private::Ok(Token {
                                chain_id: __field0,
                                name: __field1,
                                address: __field2,
                                decimals: __field3,
                                symbol: __field4,
                            })
                        }
                        #[inline]
                        fn visit_map<__A>(
                            self,
                            mut __map: __A,
                        ) -> _serde::__private::Result<Self::Value, __A::Error>
                        where
                            __A: _serde::de::MapAccess<'de>,
                        {
                            let mut __field0: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field1: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field2: _serde::__private::Option<String> = _serde::__private::None;
                            let mut __field3: _serde::__private::Option<i32> = _serde::__private::None;
                            let mut __field4: _serde::__private::Option<String> = _serde::__private::None;
                            while let _serde::__private::Some(__key)
                                = match _serde::de::MapAccess::next_key::<
                                    __Field,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                match __key {
                                    __Field::__field0 => {
                                        if _serde::__private::Option::is_some(&__field0) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "chain_id",
                                                ),
                                            );
                                        }
                                        __field0 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field1 => {
                                        if _serde::__private::Option::is_some(&__field1) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field("name"),
                                            );
                                        }
                                        __field1 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field2 => {
                                        if _serde::__private::Option::is_some(&__field2) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "address",
                                                ),
                                            );
                                        }
                                        __field2 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field3 => {
                                        if _serde::__private::Option::is_some(&__field3) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field(
                                                    "decimals",
                                                ),
                                            );
                                        }
                                        __field3 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<i32>(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    __Field::__field4 => {
                                        if _serde::__private::Option::is_some(&__field4) {
                                            return _serde::__private::Err(
                                                <__A::Error as _serde::de::Error>::duplicate_field("symbol"),
                                            );
                                        }
                                        __field4 = _serde::__private::Some(
                                            match _serde::de::MapAccess::next_value::<
                                                String,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            },
                                        );
                                    }
                                    _ => {
                                        let _ = match _serde::de::MapAccess::next_value::<
                                            _serde::de::IgnoredAny,
                                        >(&mut __map) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                    }
                                }
                            }
                            let __field0 = match __field0 {
                                _serde::__private::Some(__field0) => __field0,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("chain_id") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field1 = match __field1 {
                                _serde::__private::Some(__field1) => __field1,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("name") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field2 = match __field2 {
                                _serde::__private::Some(__field2) => __field2,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("address") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field3 = match __field3 {
                                _serde::__private::Some(__field3) => __field3,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("decimals") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            let __field4 = match __field4 {
                                _serde::__private::Some(__field4) => __field4,
                                _serde::__private::None => {
                                    match _serde::__private::de::missing_field("symbol") {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    }
                                }
                            };
                            _serde::__private::Ok(Token {
                                chain_id: __field0,
                                name: __field1,
                                address: __field2,
                                decimals: __field3,
                                symbol: __field4,
                            })
                        }
                    }
                    const FIELDS: &'static [&'static str] = &[
                        "chain_id",
                        "name",
                        "address",
                        "decimals",
                        "symbol",
                    ];
                    _serde::Deserializer::deserialize_struct(
                        __deserializer,
                        "Token",
                        FIELDS,
                        __Visitor {
                            marker: _serde::__private::PhantomData::<Token>,
                            lifetime: _serde::__private::PhantomData,
                        },
                    )
                }
            }
        };
        #[doc(hidden)]
        #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
        const _: () = {
            #[allow(unused_extern_crates, clippy::useless_attribute)]
            extern crate serde as _serde;
            #[automatically_derived]
            impl _serde::Serialize for Token {
                fn serialize<__S>(
                    &self,
                    __serializer: __S,
                ) -> _serde::__private::Result<__S::Ok, __S::Error>
                where
                    __S: _serde::Serializer,
                {
                    let mut __serde_state = match _serde::Serializer::serialize_struct(
                        __serializer,
                        "Token",
                        false as usize + 1 + 1 + 1 + 1 + 1,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "chain_id",
                        &self.chain_id,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "name",
                        &self.name,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "address",
                        &self.address,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "decimals",
                        &self.decimals,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    match _serde::ser::SerializeStruct::serialize_field(
                        &mut __serde_state,
                        "symbol",
                        &self.symbol,
                    ) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    };
                    _serde::ser::SerializeStruct::end(__serde_state)
                }
            }
        };
        impl Token {
            pub fn new() -> Token {
                Token {
                    chain_id: String::new(),
                    name: String::new(),
                    address: String::new(),
                    decimals: 0,
                    symbol: String::new(),
                }
            }
            pub fn to_buffer(args: &Token) -> Result<Vec<u8>, EncodeError> {
                serialize_token(args)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn from_buffer(args: &[u8]) -> Result<Token, DecodeError> {
                deserialize_token(args)
                    .map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
            pub fn write<W: Write>(
                args: &Token,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                write_token(args, writer)
                    .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
            }
            pub fn read<R: Read>(reader: &mut R) -> Result<Token, DecodeError> {
                read_token(reader).map_err(|e| DecodeError::TypeReadError(e.to_string()))
            }
        }
    }
    pub use token::Token;
    pub mod imported {
        pub mod http_http_request {
            use serde::{Serialize, Deserialize};
            pub mod serialization {
                use std::convert::TryFrom;
                use polywrap_wasm_rs::{
                    BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                    ReadDecoder, Write, WriteEncoder, JSON,
                };
                use crate::HttpHttpRequest;
                use crate::{
                    HttpHttpResponseType, get_http_http_response_type_value,
                    sanitize_http_http_response_type_value,
                };
                pub fn serialize_http_http_request(
                    args: &HttpHttpRequest,
                ) -> Result<Vec<u8>, EncodeError> {
                    let mut encoder_context = Context::new();
                    encoder_context
                        .description = "Serializing (encoding) imported object-type: HttpHttpRequest"
                        .to_string();
                    let mut encoder = WriteEncoder::new(&[], encoder_context);
                    write_http_http_request(args, &mut encoder)?;
                    Ok(encoder.get_buffer())
                }
                pub fn write_http_http_request<W: Write>(
                    args: &HttpHttpRequest,
                    writer: &mut W,
                ) -> Result<(), EncodeError> {
                    writer.write_map_length(&4)?;
                    writer
                        .context()
                        .push(
                            "headers",
                            "Option<Map<String, String>>",
                            "writing property",
                        );
                    writer.write_string("headers")?;
                    writer
                        .write_optional_ext_generic_map(
                            &args.headers,
                            |writer, key| { writer.write_string(key) },
                            |writer, value| { writer.write_string(value) },
                        )?;
                    writer.context().pop();
                    writer
                        .context()
                        .push(
                            "urlParams",
                            "Option<Map<String, String>>",
                            "writing property",
                        );
                    writer.write_string("urlParams")?;
                    writer
                        .write_optional_ext_generic_map(
                            &args.url_params,
                            |writer, key| { writer.write_string(key) },
                            |writer, value| { writer.write_string(value) },
                        )?;
                    writer.context().pop();
                    writer
                        .context()
                        .push(
                            "responseType",
                            "HttpHttpResponseType",
                            "writing property",
                        );
                    writer.write_string("responseType")?;
                    writer.write_i32(&(args.response_type as i32))?;
                    writer.context().pop();
                    writer.context().push("body", "Option<String>", "writing property");
                    writer.write_string("body")?;
                    writer.write_optional_string(&args.body)?;
                    writer.context().pop();
                    Ok(())
                }
                pub fn deserialize_http_http_request(
                    args: &[u8],
                ) -> Result<HttpHttpRequest, DecodeError> {
                    let mut context = Context::new();
                    context
                        .description = "Deserializing imported object-type: HttpHttpRequest"
                        .to_string();
                    let mut reader = ReadDecoder::new(args, context);
                    read_http_http_request(&mut reader)
                }
                pub fn read_http_http_request<R: Read>(
                    reader: &mut R,
                ) -> Result<HttpHttpRequest, DecodeError> {
                    let mut num_of_fields = reader.read_map_length()?;
                    let mut _headers: Option<Map<String, String>> = None;
                    let mut _url_params: Option<Map<String, String>> = None;
                    let mut _response_type: HttpHttpResponseType = HttpHttpResponseType::_MAX_;
                    let mut _response_type_set = false;
                    let mut _body: Option<String> = None;
                    while num_of_fields > 0 {
                        num_of_fields -= 1;
                        let field = reader.read_string()?;
                        match field.as_str() {
                            "headers" => {
                                reader
                                    .context()
                                    .push(
                                        &field,
                                        "Option<Map<String, String>>",
                                        "type found, reading property",
                                    );
                                _headers = reader
                                    .read_optional_ext_generic_map(
                                        |reader| { reader.read_string() },
                                        |reader| { reader.read_string() },
                                    )?;
                                reader.context().pop();
                            }
                            "urlParams" => {
                                reader
                                    .context()
                                    .push(
                                        &field,
                                        "Option<Map<String, String>>",
                                        "type found, reading property",
                                    );
                                _url_params = reader
                                    .read_optional_ext_generic_map(
                                        |reader| { reader.read_string() },
                                        |reader| { reader.read_string() },
                                    )?;
                                reader.context().pop();
                            }
                            "responseType" => {
                                reader
                                    .context()
                                    .push(
                                        &field,
                                        "HttpHttpResponseType",
                                        "type found, reading property",
                                    );
                                let mut value: HttpHttpResponseType = HttpHttpResponseType::_MAX_;
                                if reader.is_next_string()? {
                                    value = get_http_http_response_type_value(
                                        &reader.read_string()?,
                                    )?;
                                } else {
                                    value = HttpHttpResponseType::try_from(reader.read_i32()?)?;
                                    sanitize_http_http_response_type_value(value as i32)?;
                                }
                                _response_type = value;
                                _response_type_set = true;
                                reader.context().pop();
                            }
                            "body" => {
                                reader
                                    .context()
                                    .push(
                                        &field,
                                        "Option<String>",
                                        "type found, reading property",
                                    );
                                _body = reader.read_optional_string()?;
                                reader.context().pop();
                            }
                            err => {
                                return Err(DecodeError::UnknownFieldName(err.to_string()));
                            }
                        }
                    }
                    if !_response_type_set {
                        return Err(
                            DecodeError::MissingField(
                                "responseType: Http_Http_ResponseType.".to_string(),
                            ),
                        );
                    }
                    Ok(HttpHttpRequest {
                        headers: _headers,
                        url_params: _url_params,
                        response_type: _response_type,
                        body: _body,
                    })
                }
            }
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, DecodeError, EncodeError, Read, Write, JSON,
            };
            pub use serialization::{
                deserialize_http_http_request, read_http_http_request,
                serialize_http_http_request, write_http_http_request,
            };
            use crate::HttpHttpResponseType;
            pub struct HttpHttpRequest {
                pub headers: Option<Map<String, String>>,
                pub url_params: Option<Map<String, String>>,
                pub response_type: HttpHttpResponseType,
                pub body: Option<String>,
            }
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::clone::Clone for HttpHttpRequest {
                #[inline]
                fn clone(&self) -> HttpHttpRequest {
                    HttpHttpRequest {
                        headers: ::core::clone::Clone::clone(&self.headers),
                        url_params: ::core::clone::Clone::clone(&self.url_params),
                        response_type: ::core::clone::Clone::clone(&self.response_type),
                        body: ::core::clone::Clone::clone(&self.body),
                    }
                }
            }
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::fmt::Debug for HttpHttpRequest {
                fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                    ::core::fmt::Formatter::debug_struct_field4_finish(
                        f,
                        "HttpHttpRequest",
                        "headers",
                        &&self.headers,
                        "url_params",
                        &&self.url_params,
                        "response_type",
                        &&self.response_type,
                        "body",
                        &&self.body,
                    )
                }
            }
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl<'de> _serde::Deserialize<'de> for HttpHttpRequest {
                    fn deserialize<__D>(
                        __deserializer: __D,
                    ) -> _serde::__private::Result<Self, __D::Error>
                    where
                        __D: _serde::Deserializer<'de>,
                    {
                        #[allow(non_camel_case_types)]
                        enum __Field {
                            __field0,
                            __field1,
                            __field2,
                            __field3,
                            __ignore,
                        }
                        struct __FieldVisitor;
                        impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                            type Value = __Field;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "field identifier",
                                )
                            }
                            fn visit_u64<__E>(
                                self,
                                __value: u64,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    0u64 => _serde::__private::Ok(__Field::__field0),
                                    1u64 => _serde::__private::Ok(__Field::__field1),
                                    2u64 => _serde::__private::Ok(__Field::__field2),
                                    3u64 => _serde::__private::Ok(__Field::__field3),
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                            fn visit_str<__E>(
                                self,
                                __value: &str,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    "headers" => _serde::__private::Ok(__Field::__field0),
                                    "url_params" => _serde::__private::Ok(__Field::__field1),
                                    "response_type" => _serde::__private::Ok(__Field::__field2),
                                    "body" => _serde::__private::Ok(__Field::__field3),
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                            fn visit_bytes<__E>(
                                self,
                                __value: &[u8],
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    b"headers" => _serde::__private::Ok(__Field::__field0),
                                    b"url_params" => _serde::__private::Ok(__Field::__field1),
                                    b"response_type" => _serde::__private::Ok(__Field::__field2),
                                    b"body" => _serde::__private::Ok(__Field::__field3),
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                        }
                        impl<'de> _serde::Deserialize<'de> for __Field {
                            #[inline]
                            fn deserialize<__D>(
                                __deserializer: __D,
                            ) -> _serde::__private::Result<Self, __D::Error>
                            where
                                __D: _serde::Deserializer<'de>,
                            {
                                _serde::Deserializer::deserialize_identifier(
                                    __deserializer,
                                    __FieldVisitor,
                                )
                            }
                        }
                        struct __Visitor<'de> {
                            marker: _serde::__private::PhantomData<HttpHttpRequest>,
                            lifetime: _serde::__private::PhantomData<&'de ()>,
                        }
                        impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                            type Value = HttpHttpRequest;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "struct HttpHttpRequest",
                                )
                            }
                            #[inline]
                            fn visit_seq<__A>(
                                self,
                                mut __seq: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::SeqAccess<'de>,
                            {
                                let __field0 = match match _serde::de::SeqAccess::next_element::<
                                    Option<Map<String, String>>,
                                >(&mut __seq) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                    _serde::__private::Some(__value) => __value,
                                    _serde::__private::None => {
                                        return _serde::__private::Err(
                                            _serde::de::Error::invalid_length(
                                                0usize,
                                                &"struct HttpHttpRequest with 4 elements",
                                            ),
                                        );
                                    }
                                };
                                let __field1 = match match _serde::de::SeqAccess::next_element::<
                                    Option<Map<String, String>>,
                                >(&mut __seq) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                    _serde::__private::Some(__value) => __value,
                                    _serde::__private::None => {
                                        return _serde::__private::Err(
                                            _serde::de::Error::invalid_length(
                                                1usize,
                                                &"struct HttpHttpRequest with 4 elements",
                                            ),
                                        );
                                    }
                                };
                                let __field2 = match match _serde::de::SeqAccess::next_element::<
                                    HttpHttpResponseType,
                                >(&mut __seq) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                    _serde::__private::Some(__value) => __value,
                                    _serde::__private::None => {
                                        return _serde::__private::Err(
                                            _serde::de::Error::invalid_length(
                                                2usize,
                                                &"struct HttpHttpRequest with 4 elements",
                                            ),
                                        );
                                    }
                                };
                                let __field3 = match match _serde::de::SeqAccess::next_element::<
                                    Option<String>,
                                >(&mut __seq) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                    _serde::__private::Some(__value) => __value,
                                    _serde::__private::None => {
                                        return _serde::__private::Err(
                                            _serde::de::Error::invalid_length(
                                                3usize,
                                                &"struct HttpHttpRequest with 4 elements",
                                            ),
                                        );
                                    }
                                };
                                _serde::__private::Ok(HttpHttpRequest {
                                    headers: __field0,
                                    url_params: __field1,
                                    response_type: __field2,
                                    body: __field3,
                                })
                            }
                            #[inline]
                            fn visit_map<__A>(
                                self,
                                mut __map: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::MapAccess<'de>,
                            {
                                let mut __field0: _serde::__private::Option<
                                    Option<Map<String, String>>,
                                > = _serde::__private::None;
                                let mut __field1: _serde::__private::Option<
                                    Option<Map<String, String>>,
                                > = _serde::__private::None;
                                let mut __field2: _serde::__private::Option<
                                    HttpHttpResponseType,
                                > = _serde::__private::None;
                                let mut __field3: _serde::__private::Option<
                                    Option<String>,
                                > = _serde::__private::None;
                                while let _serde::__private::Some(__key)
                                    = match _serde::de::MapAccess::next_key::<
                                        __Field,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    } {
                                    match __key {
                                        __Field::__field0 => {
                                            if _serde::__private::Option::is_some(&__field0) {
                                                return _serde::__private::Err(
                                                    <__A::Error as _serde::de::Error>::duplicate_field(
                                                        "headers",
                                                    ),
                                                );
                                            }
                                            __field0 = _serde::__private::Some(
                                                match _serde::de::MapAccess::next_value::<
                                                    Option<Map<String, String>>,
                                                >(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                },
                                            );
                                        }
                                        __Field::__field1 => {
                                            if _serde::__private::Option::is_some(&__field1) {
                                                return _serde::__private::Err(
                                                    <__A::Error as _serde::de::Error>::duplicate_field(
                                                        "url_params",
                                                    ),
                                                );
                                            }
                                            __field1 = _serde::__private::Some(
                                                match _serde::de::MapAccess::next_value::<
                                                    Option<Map<String, String>>,
                                                >(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                },
                                            );
                                        }
                                        __Field::__field2 => {
                                            if _serde::__private::Option::is_some(&__field2) {
                                                return _serde::__private::Err(
                                                    <__A::Error as _serde::de::Error>::duplicate_field(
                                                        "response_type",
                                                    ),
                                                );
                                            }
                                            __field2 = _serde::__private::Some(
                                                match _serde::de::MapAccess::next_value::<
                                                    HttpHttpResponseType,
                                                >(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                },
                                            );
                                        }
                                        __Field::__field3 => {
                                            if _serde::__private::Option::is_some(&__field3) {
                                                return _serde::__private::Err(
                                                    <__A::Error as _serde::de::Error>::duplicate_field("body"),
                                                );
                                            }
                                            __field3 = _serde::__private::Some(
                                                match _serde::de::MapAccess::next_value::<
                                                    Option<String>,
                                                >(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                },
                                            );
                                        }
                                        _ => {
                                            let _ = match _serde::de::MapAccess::next_value::<
                                                _serde::de::IgnoredAny,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            };
                                        }
                                    }
                                }
                                let __field0 = match __field0 {
                                    _serde::__private::Some(__field0) => __field0,
                                    _serde::__private::None => {
                                        match _serde::__private::de::missing_field("headers") {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        }
                                    }
                                };
                                let __field1 = match __field1 {
                                    _serde::__private::Some(__field1) => __field1,
                                    _serde::__private::None => {
                                        match _serde::__private::de::missing_field("url_params") {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        }
                                    }
                                };
                                let __field2 = match __field2 {
                                    _serde::__private::Some(__field2) => __field2,
                                    _serde::__private::None => {
                                        match _serde::__private::de::missing_field(
                                            "response_type",
                                        ) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        }
                                    }
                                };
                                let __field3 = match __field3 {
                                    _serde::__private::Some(__field3) => __field3,
                                    _serde::__private::None => {
                                        match _serde::__private::de::missing_field("body") {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        }
                                    }
                                };
                                _serde::__private::Ok(HttpHttpRequest {
                                    headers: __field0,
                                    url_params: __field1,
                                    response_type: __field2,
                                    body: __field3,
                                })
                            }
                        }
                        const FIELDS: &'static [&'static str] = &[
                            "headers",
                            "url_params",
                            "response_type",
                            "body",
                        ];
                        _serde::Deserializer::deserialize_struct(
                            __deserializer,
                            "HttpHttpRequest",
                            FIELDS,
                            __Visitor {
                                marker: _serde::__private::PhantomData::<HttpHttpRequest>,
                                lifetime: _serde::__private::PhantomData,
                            },
                        )
                    }
                }
            };
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl _serde::Serialize for HttpHttpRequest {
                    fn serialize<__S>(
                        &self,
                        __serializer: __S,
                    ) -> _serde::__private::Result<__S::Ok, __S::Error>
                    where
                        __S: _serde::Serializer,
                    {
                        let mut __serde_state = match _serde::Serializer::serialize_struct(
                            __serializer,
                            "HttpHttpRequest",
                            false as usize + 1 + 1 + 1 + 1,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        match _serde::ser::SerializeStruct::serialize_field(
                            &mut __serde_state,
                            "headers",
                            &self.headers,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        match _serde::ser::SerializeStruct::serialize_field(
                            &mut __serde_state,
                            "url_params",
                            &self.url_params,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        match _serde::ser::SerializeStruct::serialize_field(
                            &mut __serde_state,
                            "response_type",
                            &self.response_type,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        match _serde::ser::SerializeStruct::serialize_field(
                            &mut __serde_state,
                            "body",
                            &self.body,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        _serde::ser::SerializeStruct::end(__serde_state)
                    }
                }
            };
            impl HttpHttpRequest {
                pub const URI: &'static str = "wrap://ens/http.polywrap.eth";
                pub fn new() -> HttpHttpRequest {
                    HttpHttpRequest {
                        headers: None,
                        url_params: None,
                        response_type: HttpHttpResponseType::_MAX_,
                        body: None,
                    }
                }
                pub fn to_buffer(
                    args: &HttpHttpRequest,
                ) -> Result<Vec<u8>, EncodeError> {
                    serialize_http_http_request(args)
                        .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
                }
                pub fn from_buffer(args: &[u8]) -> Result<HttpHttpRequest, DecodeError> {
                    deserialize_http_http_request(args)
                        .map_err(|e| DecodeError::TypeReadError(e.to_string()))
                }
                pub fn write<W: Write>(
                    args: &HttpHttpRequest,
                    writer: &mut W,
                ) -> Result<(), EncodeError> {
                    write_http_http_request(args, writer)
                        .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
                }
                pub fn read<R: Read>(
                    reader: &mut R,
                ) -> Result<HttpHttpRequest, DecodeError> {
                    read_http_http_request(reader)
                        .map_err(|e| DecodeError::TypeReadError(e.to_string()))
                }
            }
        }
        pub use http_http_request::*;
        pub mod http_http_response {
            use serde::{Serialize, Deserialize};
            pub mod serialization {
                use std::convert::TryFrom;
                use polywrap_wasm_rs::{
                    BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                    ReadDecoder, Write, WriteEncoder, JSON,
                };
                use crate::HttpHttpResponse;
                pub fn serialize_http_http_response(
                    args: &HttpHttpResponse,
                ) -> Result<Vec<u8>, EncodeError> {
                    let mut encoder_context = Context::new();
                    encoder_context
                        .description = "Serializing (encoding) imported object-type: HttpHttpResponse"
                        .to_string();
                    let mut encoder = WriteEncoder::new(&[], encoder_context);
                    write_http_http_response(args, &mut encoder)?;
                    Ok(encoder.get_buffer())
                }
                pub fn write_http_http_response<W: Write>(
                    args: &HttpHttpResponse,
                    writer: &mut W,
                ) -> Result<(), EncodeError> {
                    writer.write_map_length(&4)?;
                    writer.context().push("status", "i32", "writing property");
                    writer.write_string("status")?;
                    writer.write_i32(&args.status)?;
                    writer.context().pop();
                    writer.context().push("statusText", "String", "writing property");
                    writer.write_string("statusText")?;
                    writer.write_string(&args.status_text)?;
                    writer.context().pop();
                    writer
                        .context()
                        .push(
                            "headers",
                            "Option<Map<String, String>>",
                            "writing property",
                        );
                    writer.write_string("headers")?;
                    writer
                        .write_optional_ext_generic_map(
                            &args.headers,
                            |writer, key| { writer.write_string(key) },
                            |writer, value| { writer.write_string(value) },
                        )?;
                    writer.context().pop();
                    writer.context().push("body", "Option<String>", "writing property");
                    writer.write_string("body")?;
                    writer.write_optional_string(&args.body)?;
                    writer.context().pop();
                    Ok(())
                }
                pub fn deserialize_http_http_response(
                    args: &[u8],
                ) -> Result<HttpHttpResponse, DecodeError> {
                    let mut context = Context::new();
                    context
                        .description = "Deserializing imported object-type: HttpHttpResponse"
                        .to_string();
                    let mut reader = ReadDecoder::new(args, context);
                    read_http_http_response(&mut reader)
                }
                pub fn read_http_http_response<R: Read>(
                    reader: &mut R,
                ) -> Result<HttpHttpResponse, DecodeError> {
                    let mut num_of_fields = reader.read_map_length()?;
                    let mut _status: i32 = 0;
                    let mut _status_set = false;
                    let mut _status_text: String = String::new();
                    let mut _status_text_set = false;
                    let mut _headers: Option<Map<String, String>> = None;
                    let mut _body: Option<String> = None;
                    while num_of_fields > 0 {
                        num_of_fields -= 1;
                        let field = reader.read_string()?;
                        match field.as_str() {
                            "status" => {
                                reader
                                    .context()
                                    .push(&field, "i32", "type found, reading property");
                                _status = reader.read_i32()?;
                                _status_set = true;
                                reader.context().pop();
                            }
                            "statusText" => {
                                reader
                                    .context()
                                    .push(&field, "String", "type found, reading property");
                                _status_text = reader.read_string()?;
                                _status_text_set = true;
                                reader.context().pop();
                            }
                            "headers" => {
                                reader
                                    .context()
                                    .push(
                                        &field,
                                        "Option<Map<String, String>>",
                                        "type found, reading property",
                                    );
                                _headers = reader
                                    .read_optional_ext_generic_map(
                                        |reader| { reader.read_string() },
                                        |reader| { reader.read_string() },
                                    )?;
                                reader.context().pop();
                            }
                            "body" => {
                                reader
                                    .context()
                                    .push(
                                        &field,
                                        "Option<String>",
                                        "type found, reading property",
                                    );
                                _body = reader.read_optional_string()?;
                                reader.context().pop();
                            }
                            err => {
                                return Err(DecodeError::UnknownFieldName(err.to_string()));
                            }
                        }
                    }
                    if !_status_set {
                        return Err(
                            DecodeError::MissingField("status: Int.".to_string()),
                        );
                    }
                    if !_status_text_set {
                        return Err(
                            DecodeError::MissingField("statusText: String.".to_string()),
                        );
                    }
                    Ok(HttpHttpResponse {
                        status: _status,
                        status_text: _status_text,
                        headers: _headers,
                        body: _body,
                    })
                }
            }
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, DecodeError, EncodeError, Read, Write, JSON,
            };
            pub use serialization::{
                deserialize_http_http_response, read_http_http_response,
                serialize_http_http_response, write_http_http_response,
            };
            pub struct HttpHttpResponse {
                pub status: i32,
                pub status_text: String,
                pub headers: Option<Map<String, String>>,
                pub body: Option<String>,
            }
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::clone::Clone for HttpHttpResponse {
                #[inline]
                fn clone(&self) -> HttpHttpResponse {
                    HttpHttpResponse {
                        status: ::core::clone::Clone::clone(&self.status),
                        status_text: ::core::clone::Clone::clone(&self.status_text),
                        headers: ::core::clone::Clone::clone(&self.headers),
                        body: ::core::clone::Clone::clone(&self.body),
                    }
                }
            }
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::fmt::Debug for HttpHttpResponse {
                fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                    ::core::fmt::Formatter::debug_struct_field4_finish(
                        f,
                        "HttpHttpResponse",
                        "status",
                        &&self.status,
                        "status_text",
                        &&self.status_text,
                        "headers",
                        &&self.headers,
                        "body",
                        &&self.body,
                    )
                }
            }
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl<'de> _serde::Deserialize<'de> for HttpHttpResponse {
                    fn deserialize<__D>(
                        __deserializer: __D,
                    ) -> _serde::__private::Result<Self, __D::Error>
                    where
                        __D: _serde::Deserializer<'de>,
                    {
                        #[allow(non_camel_case_types)]
                        enum __Field {
                            __field0,
                            __field1,
                            __field2,
                            __field3,
                            __ignore,
                        }
                        struct __FieldVisitor;
                        impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                            type Value = __Field;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "field identifier",
                                )
                            }
                            fn visit_u64<__E>(
                                self,
                                __value: u64,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    0u64 => _serde::__private::Ok(__Field::__field0),
                                    1u64 => _serde::__private::Ok(__Field::__field1),
                                    2u64 => _serde::__private::Ok(__Field::__field2),
                                    3u64 => _serde::__private::Ok(__Field::__field3),
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                            fn visit_str<__E>(
                                self,
                                __value: &str,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    "status" => _serde::__private::Ok(__Field::__field0),
                                    "status_text" => _serde::__private::Ok(__Field::__field1),
                                    "headers" => _serde::__private::Ok(__Field::__field2),
                                    "body" => _serde::__private::Ok(__Field::__field3),
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                            fn visit_bytes<__E>(
                                self,
                                __value: &[u8],
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    b"status" => _serde::__private::Ok(__Field::__field0),
                                    b"status_text" => _serde::__private::Ok(__Field::__field1),
                                    b"headers" => _serde::__private::Ok(__Field::__field2),
                                    b"body" => _serde::__private::Ok(__Field::__field3),
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                        }
                        impl<'de> _serde::Deserialize<'de> for __Field {
                            #[inline]
                            fn deserialize<__D>(
                                __deserializer: __D,
                            ) -> _serde::__private::Result<Self, __D::Error>
                            where
                                __D: _serde::Deserializer<'de>,
                            {
                                _serde::Deserializer::deserialize_identifier(
                                    __deserializer,
                                    __FieldVisitor,
                                )
                            }
                        }
                        struct __Visitor<'de> {
                            marker: _serde::__private::PhantomData<HttpHttpResponse>,
                            lifetime: _serde::__private::PhantomData<&'de ()>,
                        }
                        impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                            type Value = HttpHttpResponse;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "struct HttpHttpResponse",
                                )
                            }
                            #[inline]
                            fn visit_seq<__A>(
                                self,
                                mut __seq: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::SeqAccess<'de>,
                            {
                                let __field0 = match match _serde::de::SeqAccess::next_element::<
                                    i32,
                                >(&mut __seq) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                    _serde::__private::Some(__value) => __value,
                                    _serde::__private::None => {
                                        return _serde::__private::Err(
                                            _serde::de::Error::invalid_length(
                                                0usize,
                                                &"struct HttpHttpResponse with 4 elements",
                                            ),
                                        );
                                    }
                                };
                                let __field1 = match match _serde::de::SeqAccess::next_element::<
                                    String,
                                >(&mut __seq) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                    _serde::__private::Some(__value) => __value,
                                    _serde::__private::None => {
                                        return _serde::__private::Err(
                                            _serde::de::Error::invalid_length(
                                                1usize,
                                                &"struct HttpHttpResponse with 4 elements",
                                            ),
                                        );
                                    }
                                };
                                let __field2 = match match _serde::de::SeqAccess::next_element::<
                                    Option<Map<String, String>>,
                                >(&mut __seq) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                    _serde::__private::Some(__value) => __value,
                                    _serde::__private::None => {
                                        return _serde::__private::Err(
                                            _serde::de::Error::invalid_length(
                                                2usize,
                                                &"struct HttpHttpResponse with 4 elements",
                                            ),
                                        );
                                    }
                                };
                                let __field3 = match match _serde::de::SeqAccess::next_element::<
                                    Option<String>,
                                >(&mut __seq) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                    _serde::__private::Some(__value) => __value,
                                    _serde::__private::None => {
                                        return _serde::__private::Err(
                                            _serde::de::Error::invalid_length(
                                                3usize,
                                                &"struct HttpHttpResponse with 4 elements",
                                            ),
                                        );
                                    }
                                };
                                _serde::__private::Ok(HttpHttpResponse {
                                    status: __field0,
                                    status_text: __field1,
                                    headers: __field2,
                                    body: __field3,
                                })
                            }
                            #[inline]
                            fn visit_map<__A>(
                                self,
                                mut __map: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::MapAccess<'de>,
                            {
                                let mut __field0: _serde::__private::Option<i32> = _serde::__private::None;
                                let mut __field1: _serde::__private::Option<String> = _serde::__private::None;
                                let mut __field2: _serde::__private::Option<
                                    Option<Map<String, String>>,
                                > = _serde::__private::None;
                                let mut __field3: _serde::__private::Option<
                                    Option<String>,
                                > = _serde::__private::None;
                                while let _serde::__private::Some(__key)
                                    = match _serde::de::MapAccess::next_key::<
                                        __Field,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    } {
                                    match __key {
                                        __Field::__field0 => {
                                            if _serde::__private::Option::is_some(&__field0) {
                                                return _serde::__private::Err(
                                                    <__A::Error as _serde::de::Error>::duplicate_field("status"),
                                                );
                                            }
                                            __field0 = _serde::__private::Some(
                                                match _serde::de::MapAccess::next_value::<i32>(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                },
                                            );
                                        }
                                        __Field::__field1 => {
                                            if _serde::__private::Option::is_some(&__field1) {
                                                return _serde::__private::Err(
                                                    <__A::Error as _serde::de::Error>::duplicate_field(
                                                        "status_text",
                                                    ),
                                                );
                                            }
                                            __field1 = _serde::__private::Some(
                                                match _serde::de::MapAccess::next_value::<
                                                    String,
                                                >(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                },
                                            );
                                        }
                                        __Field::__field2 => {
                                            if _serde::__private::Option::is_some(&__field2) {
                                                return _serde::__private::Err(
                                                    <__A::Error as _serde::de::Error>::duplicate_field(
                                                        "headers",
                                                    ),
                                                );
                                            }
                                            __field2 = _serde::__private::Some(
                                                match _serde::de::MapAccess::next_value::<
                                                    Option<Map<String, String>>,
                                                >(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                },
                                            );
                                        }
                                        __Field::__field3 => {
                                            if _serde::__private::Option::is_some(&__field3) {
                                                return _serde::__private::Err(
                                                    <__A::Error as _serde::de::Error>::duplicate_field("body"),
                                                );
                                            }
                                            __field3 = _serde::__private::Some(
                                                match _serde::de::MapAccess::next_value::<
                                                    Option<String>,
                                                >(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                },
                                            );
                                        }
                                        _ => {
                                            let _ = match _serde::de::MapAccess::next_value::<
                                                _serde::de::IgnoredAny,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            };
                                        }
                                    }
                                }
                                let __field0 = match __field0 {
                                    _serde::__private::Some(__field0) => __field0,
                                    _serde::__private::None => {
                                        match _serde::__private::de::missing_field("status") {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        }
                                    }
                                };
                                let __field1 = match __field1 {
                                    _serde::__private::Some(__field1) => __field1,
                                    _serde::__private::None => {
                                        match _serde::__private::de::missing_field("status_text") {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        }
                                    }
                                };
                                let __field2 = match __field2 {
                                    _serde::__private::Some(__field2) => __field2,
                                    _serde::__private::None => {
                                        match _serde::__private::de::missing_field("headers") {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        }
                                    }
                                };
                                let __field3 = match __field3 {
                                    _serde::__private::Some(__field3) => __field3,
                                    _serde::__private::None => {
                                        match _serde::__private::de::missing_field("body") {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        }
                                    }
                                };
                                _serde::__private::Ok(HttpHttpResponse {
                                    status: __field0,
                                    status_text: __field1,
                                    headers: __field2,
                                    body: __field3,
                                })
                            }
                        }
                        const FIELDS: &'static [&'static str] = &[
                            "status",
                            "status_text",
                            "headers",
                            "body",
                        ];
                        _serde::Deserializer::deserialize_struct(
                            __deserializer,
                            "HttpHttpResponse",
                            FIELDS,
                            __Visitor {
                                marker: _serde::__private::PhantomData::<HttpHttpResponse>,
                                lifetime: _serde::__private::PhantomData,
                            },
                        )
                    }
                }
            };
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl _serde::Serialize for HttpHttpResponse {
                    fn serialize<__S>(
                        &self,
                        __serializer: __S,
                    ) -> _serde::__private::Result<__S::Ok, __S::Error>
                    where
                        __S: _serde::Serializer,
                    {
                        let mut __serde_state = match _serde::Serializer::serialize_struct(
                            __serializer,
                            "HttpHttpResponse",
                            false as usize + 1 + 1 + 1 + 1,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        match _serde::ser::SerializeStruct::serialize_field(
                            &mut __serde_state,
                            "status",
                            &self.status,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        match _serde::ser::SerializeStruct::serialize_field(
                            &mut __serde_state,
                            "status_text",
                            &self.status_text,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        match _serde::ser::SerializeStruct::serialize_field(
                            &mut __serde_state,
                            "headers",
                            &self.headers,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        match _serde::ser::SerializeStruct::serialize_field(
                            &mut __serde_state,
                            "body",
                            &self.body,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        _serde::ser::SerializeStruct::end(__serde_state)
                    }
                }
            };
            impl HttpHttpResponse {
                pub const URI: &'static str = "wrap://ens/http.polywrap.eth";
                pub fn new() -> HttpHttpResponse {
                    HttpHttpResponse {
                        status: 0,
                        status_text: String::new(),
                        headers: None,
                        body: None,
                    }
                }
                pub fn to_buffer(
                    args: &HttpHttpResponse,
                ) -> Result<Vec<u8>, EncodeError> {
                    serialize_http_http_response(args)
                        .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
                }
                pub fn from_buffer(
                    args: &[u8],
                ) -> Result<HttpHttpResponse, DecodeError> {
                    deserialize_http_http_response(args)
                        .map_err(|e| DecodeError::TypeReadError(e.to_string()))
                }
                pub fn write<W: Write>(
                    args: &HttpHttpResponse,
                    writer: &mut W,
                ) -> Result<(), EncodeError> {
                    write_http_http_response(args, writer)
                        .map_err(|e| EncodeError::TypeWriteError(e.to_string()))
                }
                pub fn read<R: Read>(
                    reader: &mut R,
                ) -> Result<HttpHttpResponse, DecodeError> {
                    read_http_http_response(reader)
                        .map_err(|e| DecodeError::TypeReadError(e.to_string()))
                }
            }
        }
        pub use http_http_response::*;
        pub mod http_http_response_type {
            use polywrap_wasm_rs::EnumTypeError;
            use serde::{Serialize, Deserialize};
            use std::convert::TryFrom;
            pub enum HttpHttpResponseType {
                TEXT,
                BINARY,
                _MAX_,
            }
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::clone::Clone for HttpHttpResponseType {
                #[inline]
                fn clone(&self) -> HttpHttpResponseType {
                    { *self }
                }
            }
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::marker::Copy for HttpHttpResponseType {}
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::fmt::Debug for HttpHttpResponseType {
                fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                    match (&*self,) {
                        (&HttpHttpResponseType::TEXT,) => {
                            ::core::fmt::Formatter::write_str(f, "TEXT")
                        }
                        (&HttpHttpResponseType::BINARY,) => {
                            ::core::fmt::Formatter::write_str(f, "BINARY")
                        }
                        (&HttpHttpResponseType::_MAX_,) => {
                            ::core::fmt::Formatter::write_str(f, "_MAX_")
                        }
                    }
                }
            }
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl<'de> _serde::Deserialize<'de> for HttpHttpResponseType {
                    fn deserialize<__D>(
                        __deserializer: __D,
                    ) -> _serde::__private::Result<Self, __D::Error>
                    where
                        __D: _serde::Deserializer<'de>,
                    {
                        #[allow(non_camel_case_types)]
                        enum __Field {
                            __field0,
                            __field1,
                            __field2,
                        }
                        struct __FieldVisitor;
                        impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                            type Value = __Field;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "variant identifier",
                                )
                            }
                            fn visit_u64<__E>(
                                self,
                                __value: u64,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    0u64 => _serde::__private::Ok(__Field::__field0),
                                    1u64 => _serde::__private::Ok(__Field::__field1),
                                    2u64 => _serde::__private::Ok(__Field::__field2),
                                    _ => {
                                        _serde::__private::Err(
                                            _serde::de::Error::invalid_value(
                                                _serde::de::Unexpected::Unsigned(__value),
                                                &"variant index 0 <= i < 3",
                                            ),
                                        )
                                    }
                                }
                            }
                            fn visit_str<__E>(
                                self,
                                __value: &str,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    "TEXT" => _serde::__private::Ok(__Field::__field0),
                                    "BINARY" => _serde::__private::Ok(__Field::__field1),
                                    "_MAX_" => _serde::__private::Ok(__Field::__field2),
                                    _ => {
                                        _serde::__private::Err(
                                            _serde::de::Error::unknown_variant(__value, VARIANTS),
                                        )
                                    }
                                }
                            }
                            fn visit_bytes<__E>(
                                self,
                                __value: &[u8],
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    b"TEXT" => _serde::__private::Ok(__Field::__field0),
                                    b"BINARY" => _serde::__private::Ok(__Field::__field1),
                                    b"_MAX_" => _serde::__private::Ok(__Field::__field2),
                                    _ => {
                                        let __value = &_serde::__private::from_utf8_lossy(__value);
                                        _serde::__private::Err(
                                            _serde::de::Error::unknown_variant(__value, VARIANTS),
                                        )
                                    }
                                }
                            }
                        }
                        impl<'de> _serde::Deserialize<'de> for __Field {
                            #[inline]
                            fn deserialize<__D>(
                                __deserializer: __D,
                            ) -> _serde::__private::Result<Self, __D::Error>
                            where
                                __D: _serde::Deserializer<'de>,
                            {
                                _serde::Deserializer::deserialize_identifier(
                                    __deserializer,
                                    __FieldVisitor,
                                )
                            }
                        }
                        struct __Visitor<'de> {
                            marker: _serde::__private::PhantomData<HttpHttpResponseType>,
                            lifetime: _serde::__private::PhantomData<&'de ()>,
                        }
                        impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                            type Value = HttpHttpResponseType;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "enum HttpHttpResponseType",
                                )
                            }
                            fn visit_enum<__A>(
                                self,
                                __data: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::EnumAccess<'de>,
                            {
                                match match _serde::de::EnumAccess::variant(__data) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                    (__Field::__field0, __variant) => {
                                        match _serde::de::VariantAccess::unit_variant(__variant) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                        _serde::__private::Ok(HttpHttpResponseType::TEXT)
                                    }
                                    (__Field::__field1, __variant) => {
                                        match _serde::de::VariantAccess::unit_variant(__variant) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                        _serde::__private::Ok(HttpHttpResponseType::BINARY)
                                    }
                                    (__Field::__field2, __variant) => {
                                        match _serde::de::VariantAccess::unit_variant(__variant) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        };
                                        _serde::__private::Ok(HttpHttpResponseType::_MAX_)
                                    }
                                }
                            }
                        }
                        const VARIANTS: &'static [&'static str] = &[
                            "TEXT",
                            "BINARY",
                            "_MAX_",
                        ];
                        _serde::Deserializer::deserialize_enum(
                            __deserializer,
                            "HttpHttpResponseType",
                            VARIANTS,
                            __Visitor {
                                marker: _serde::__private::PhantomData::<
                                    HttpHttpResponseType,
                                >,
                                lifetime: _serde::__private::PhantomData,
                            },
                        )
                    }
                }
            };
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl _serde::Serialize for HttpHttpResponseType {
                    fn serialize<__S>(
                        &self,
                        __serializer: __S,
                    ) -> _serde::__private::Result<__S::Ok, __S::Error>
                    where
                        __S: _serde::Serializer,
                    {
                        match *self {
                            HttpHttpResponseType::TEXT => {
                                _serde::Serializer::serialize_unit_variant(
                                    __serializer,
                                    "HttpHttpResponseType",
                                    0u32,
                                    "TEXT",
                                )
                            }
                            HttpHttpResponseType::BINARY => {
                                _serde::Serializer::serialize_unit_variant(
                                    __serializer,
                                    "HttpHttpResponseType",
                                    1u32,
                                    "BINARY",
                                )
                            }
                            HttpHttpResponseType::_MAX_ => {
                                _serde::Serializer::serialize_unit_variant(
                                    __serializer,
                                    "HttpHttpResponseType",
                                    2u32,
                                    "_MAX_",
                                )
                            }
                        }
                    }
                }
            };
            pub fn sanitize_http_http_response_type_value(
                value: i32,
            ) -> Result<(), EnumTypeError> {
                if value < 0 && value >= HttpHttpResponseType::_MAX_ as i32 {
                    return Err(
                        EnumTypeError::EnumProcessingError({
                            let res = ::alloc::fmt::format(
                                ::core::fmt::Arguments::new_v1(
                                    &["Invalid value for enum \'HttpHttpResponseType\': "],
                                    &[::core::fmt::ArgumentV1::new_display(&value.to_string())],
                                ),
                            );
                            res
                        }),
                    );
                }
                Ok(())
            }
            pub fn get_http_http_response_type_value(
                key: &str,
            ) -> Result<HttpHttpResponseType, EnumTypeError> {
                match key {
                    "TEXT" => Ok(HttpHttpResponseType::TEXT),
                    "BINARY" => Ok(HttpHttpResponseType::BINARY),
                    "_MAX_" => Ok(HttpHttpResponseType::_MAX_),
                    err => {
                        Err(
                            EnumTypeError::EnumProcessingError({
                                let res = ::alloc::fmt::format(
                                    ::core::fmt::Arguments::new_v1(
                                        &["Invalid key for enum \'HttpHttpResponseType\': "],
                                        &[::core::fmt::ArgumentV1::new_display(&err)],
                                    ),
                                );
                                res
                            }),
                        )
                    }
                }
            }
            pub fn get_http_http_response_type_key(
                value: HttpHttpResponseType,
            ) -> Result<String, EnumTypeError> {
                if sanitize_http_http_response_type_value(value as i32).is_ok() {
                    match value {
                        HttpHttpResponseType::TEXT => Ok("TEXT".to_string()),
                        HttpHttpResponseType::BINARY => Ok("BINARY".to_string()),
                        HttpHttpResponseType::_MAX_ => Ok("_MAX_".to_string()),
                    }
                } else {
                    Err(
                        EnumTypeError::EnumProcessingError({
                            let res = ::alloc::fmt::format(
                                ::core::fmt::Arguments::new_v1(
                                    &["Invalid value for enum \'HttpHttpResponseType\': "],
                                    &[
                                        ::core::fmt::ArgumentV1::new_display(
                                            &(value as i32).to_string(),
                                        ),
                                    ],
                                ),
                            );
                            res
                        }),
                    )
                }
            }
            impl TryFrom<i32> for HttpHttpResponseType {
                type Error = EnumTypeError;
                fn try_from(v: i32) -> Result<HttpHttpResponseType, Self::Error> {
                    match v {
                        x if x == HttpHttpResponseType::TEXT as i32 => {
                            Ok(HttpHttpResponseType::TEXT)
                        }
                        x if x == HttpHttpResponseType::BINARY as i32 => {
                            Ok(HttpHttpResponseType::BINARY)
                        }
                        x if x == HttpHttpResponseType::_MAX_ as i32 => {
                            Ok(HttpHttpResponseType::_MAX_)
                        }
                        _ => {
                            Err(
                                EnumTypeError::ParseEnumError({
                                    let res = ::alloc::fmt::format(
                                        ::core::fmt::Arguments::new_v1(
                                            &["Invalid value for enum \'HttpHttpResponseType\': "],
                                            &[
                                                ::core::fmt::ArgumentV1::new_display(
                                                    &(v as i32).to_string(),
                                                ),
                                            ],
                                        ),
                                    );
                                    res
                                }),
                            )
                        }
                    }
                }
            }
        }
        pub use http_http_response_type::*;
        pub mod http_module {
            use serde::{Serialize, Deserialize};
            use polywrap_wasm_rs::{BigInt, BigNumber, Map, Read, Write, JSON, subinvoke};
            pub mod serialization {
                use serde::{Serialize, Deserialize};
                use polywrap_wasm_rs::{
                    BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                    ReadDecoder, Write, WriteEncoder, JSON,
                };
                use crate::HttpHttpRequest;
                use crate::HttpHttpResponse;
                pub struct ArgsGet {
                    pub url: String,
                    pub request: Option<HttpHttpRequest>,
                }
                #[automatically_derived]
                #[allow(unused_qualifications)]
                impl ::core::clone::Clone for ArgsGet {
                    #[inline]
                    fn clone(&self) -> ArgsGet {
                        ArgsGet {
                            url: ::core::clone::Clone::clone(&self.url),
                            request: ::core::clone::Clone::clone(&self.request),
                        }
                    }
                }
                #[automatically_derived]
                #[allow(unused_qualifications)]
                impl ::core::fmt::Debug for ArgsGet {
                    fn fmt(
                        &self,
                        f: &mut ::core::fmt::Formatter,
                    ) -> ::core::fmt::Result {
                        ::core::fmt::Formatter::debug_struct_field2_finish(
                            f,
                            "ArgsGet",
                            "url",
                            &&self.url,
                            "request",
                            &&self.request,
                        )
                    }
                }
                #[doc(hidden)]
                #[allow(
                    non_upper_case_globals,
                    unused_attributes,
                    unused_qualifications
                )]
                const _: () = {
                    #[allow(unused_extern_crates, clippy::useless_attribute)]
                    extern crate serde as _serde;
                    #[automatically_derived]
                    impl<'de> _serde::Deserialize<'de> for ArgsGet {
                        fn deserialize<__D>(
                            __deserializer: __D,
                        ) -> _serde::__private::Result<Self, __D::Error>
                        where
                            __D: _serde::Deserializer<'de>,
                        {
                            #[allow(non_camel_case_types)]
                            enum __Field {
                                __field0,
                                __field1,
                                __ignore,
                            }
                            struct __FieldVisitor;
                            impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                                type Value = __Field;
                                fn expecting(
                                    &self,
                                    __formatter: &mut _serde::__private::Formatter,
                                ) -> _serde::__private::fmt::Result {
                                    _serde::__private::Formatter::write_str(
                                        __formatter,
                                        "field identifier",
                                    )
                                }
                                fn visit_u64<__E>(
                                    self,
                                    __value: u64,
                                ) -> _serde::__private::Result<Self::Value, __E>
                                where
                                    __E: _serde::de::Error,
                                {
                                    match __value {
                                        0u64 => _serde::__private::Ok(__Field::__field0),
                                        1u64 => _serde::__private::Ok(__Field::__field1),
                                        _ => _serde::__private::Ok(__Field::__ignore),
                                    }
                                }
                                fn visit_str<__E>(
                                    self,
                                    __value: &str,
                                ) -> _serde::__private::Result<Self::Value, __E>
                                where
                                    __E: _serde::de::Error,
                                {
                                    match __value {
                                        "url" => _serde::__private::Ok(__Field::__field0),
                                        "request" => _serde::__private::Ok(__Field::__field1),
                                        _ => _serde::__private::Ok(__Field::__ignore),
                                    }
                                }
                                fn visit_bytes<__E>(
                                    self,
                                    __value: &[u8],
                                ) -> _serde::__private::Result<Self::Value, __E>
                                where
                                    __E: _serde::de::Error,
                                {
                                    match __value {
                                        b"url" => _serde::__private::Ok(__Field::__field0),
                                        b"request" => _serde::__private::Ok(__Field::__field1),
                                        _ => _serde::__private::Ok(__Field::__ignore),
                                    }
                                }
                            }
                            impl<'de> _serde::Deserialize<'de> for __Field {
                                #[inline]
                                fn deserialize<__D>(
                                    __deserializer: __D,
                                ) -> _serde::__private::Result<Self, __D::Error>
                                where
                                    __D: _serde::Deserializer<'de>,
                                {
                                    _serde::Deserializer::deserialize_identifier(
                                        __deserializer,
                                        __FieldVisitor,
                                    )
                                }
                            }
                            struct __Visitor<'de> {
                                marker: _serde::__private::PhantomData<ArgsGet>,
                                lifetime: _serde::__private::PhantomData<&'de ()>,
                            }
                            impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                                type Value = ArgsGet;
                                fn expecting(
                                    &self,
                                    __formatter: &mut _serde::__private::Formatter,
                                ) -> _serde::__private::fmt::Result {
                                    _serde::__private::Formatter::write_str(
                                        __formatter,
                                        "struct ArgsGet",
                                    )
                                }
                                #[inline]
                                fn visit_seq<__A>(
                                    self,
                                    mut __seq: __A,
                                ) -> _serde::__private::Result<Self::Value, __A::Error>
                                where
                                    __A: _serde::de::SeqAccess<'de>,
                                {
                                    let __field0 = match match _serde::de::SeqAccess::next_element::<
                                        String,
                                    >(&mut __seq) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    } {
                                        _serde::__private::Some(__value) => __value,
                                        _serde::__private::None => {
                                            return _serde::__private::Err(
                                                _serde::de::Error::invalid_length(
                                                    0usize,
                                                    &"struct ArgsGet with 2 elements",
                                                ),
                                            );
                                        }
                                    };
                                    let __field1 = match match _serde::de::SeqAccess::next_element::<
                                        Option<HttpHttpRequest>,
                                    >(&mut __seq) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    } {
                                        _serde::__private::Some(__value) => __value,
                                        _serde::__private::None => {
                                            return _serde::__private::Err(
                                                _serde::de::Error::invalid_length(
                                                    1usize,
                                                    &"struct ArgsGet with 2 elements",
                                                ),
                                            );
                                        }
                                    };
                                    _serde::__private::Ok(ArgsGet {
                                        url: __field0,
                                        request: __field1,
                                    })
                                }
                                #[inline]
                                fn visit_map<__A>(
                                    self,
                                    mut __map: __A,
                                ) -> _serde::__private::Result<Self::Value, __A::Error>
                                where
                                    __A: _serde::de::MapAccess<'de>,
                                {
                                    let mut __field0: _serde::__private::Option<String> = _serde::__private::None;
                                    let mut __field1: _serde::__private::Option<
                                        Option<HttpHttpRequest>,
                                    > = _serde::__private::None;
                                    while let _serde::__private::Some(__key)
                                        = match _serde::de::MapAccess::next_key::<
                                            __Field,
                                        >(&mut __map) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        } {
                                        match __key {
                                            __Field::__field0 => {
                                                if _serde::__private::Option::is_some(&__field0) {
                                                    return _serde::__private::Err(
                                                        <__A::Error as _serde::de::Error>::duplicate_field("url"),
                                                    );
                                                }
                                                __field0 = _serde::__private::Some(
                                                    match _serde::de::MapAccess::next_value::<
                                                        String,
                                                    >(&mut __map) {
                                                        _serde::__private::Ok(__val) => __val,
                                                        _serde::__private::Err(__err) => {
                                                            return _serde::__private::Err(__err);
                                                        }
                                                    },
                                                );
                                            }
                                            __Field::__field1 => {
                                                if _serde::__private::Option::is_some(&__field1) {
                                                    return _serde::__private::Err(
                                                        <__A::Error as _serde::de::Error>::duplicate_field(
                                                            "request",
                                                        ),
                                                    );
                                                }
                                                __field1 = _serde::__private::Some(
                                                    match _serde::de::MapAccess::next_value::<
                                                        Option<HttpHttpRequest>,
                                                    >(&mut __map) {
                                                        _serde::__private::Ok(__val) => __val,
                                                        _serde::__private::Err(__err) => {
                                                            return _serde::__private::Err(__err);
                                                        }
                                                    },
                                                );
                                            }
                                            _ => {
                                                let _ = match _serde::de::MapAccess::next_value::<
                                                    _serde::de::IgnoredAny,
                                                >(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                };
                                            }
                                        }
                                    }
                                    let __field0 = match __field0 {
                                        _serde::__private::Some(__field0) => __field0,
                                        _serde::__private::None => {
                                            match _serde::__private::de::missing_field("url") {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            }
                                        }
                                    };
                                    let __field1 = match __field1 {
                                        _serde::__private::Some(__field1) => __field1,
                                        _serde::__private::None => {
                                            match _serde::__private::de::missing_field("request") {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            }
                                        }
                                    };
                                    _serde::__private::Ok(ArgsGet {
                                        url: __field0,
                                        request: __field1,
                                    })
                                }
                            }
                            const FIELDS: &'static [&'static str] = &["url", "request"];
                            _serde::Deserializer::deserialize_struct(
                                __deserializer,
                                "ArgsGet",
                                FIELDS,
                                __Visitor {
                                    marker: _serde::__private::PhantomData::<ArgsGet>,
                                    lifetime: _serde::__private::PhantomData,
                                },
                            )
                        }
                    }
                };
                #[doc(hidden)]
                #[allow(
                    non_upper_case_globals,
                    unused_attributes,
                    unused_qualifications
                )]
                const _: () = {
                    #[allow(unused_extern_crates, clippy::useless_attribute)]
                    extern crate serde as _serde;
                    #[automatically_derived]
                    impl _serde::Serialize for ArgsGet {
                        fn serialize<__S>(
                            &self,
                            __serializer: __S,
                        ) -> _serde::__private::Result<__S::Ok, __S::Error>
                        where
                            __S: _serde::Serializer,
                        {
                            let mut __serde_state = match _serde::Serializer::serialize_struct(
                                __serializer,
                                "ArgsGet",
                                false as usize + 1 + 1,
                            ) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            };
                            match _serde::ser::SerializeStruct::serialize_field(
                                &mut __serde_state,
                                "url",
                                &self.url,
                            ) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            };
                            match _serde::ser::SerializeStruct::serialize_field(
                                &mut __serde_state,
                                "request",
                                &self.request,
                            ) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            };
                            _serde::ser::SerializeStruct::end(__serde_state)
                        }
                    }
                };
                pub fn deserialize_get_args(
                    args: &[u8],
                ) -> Result<ArgsGet, DecodeError> {
                    let mut context = Context::new();
                    context
                        .description = "Deserializing imported module-type: get Args"
                        .to_string();
                    let mut reader = ReadDecoder::new(args, context);
                    let mut num_of_fields = reader.read_map_length()?;
                    let mut _url: String = String::new();
                    let mut _url_set = false;
                    let mut _request: Option<HttpHttpRequest> = None;
                    while num_of_fields > 0 {
                        num_of_fields -= 1;
                        let field = reader.read_string()?;
                        match field.as_str() {
                            "url" => {
                                reader
                                    .context()
                                    .push(&field, "String", "type found, reading argument");
                                _url = reader.read_string()?;
                                _url_set = true;
                                reader.context().pop();
                            }
                            "request" => {
                                reader
                                    .context()
                                    .push(
                                        &field,
                                        "Option<HttpHttpRequest>",
                                        "type found, reading argument",
                                    );
                                let mut object: Option<HttpHttpRequest> = None;
                                if !reader.is_next_nil()? {
                                    object = Some(HttpHttpRequest::read(&mut reader)?);
                                } else {
                                    object = None;
                                }
                                _request = object;
                                reader.context().pop();
                            }
                            err => {
                                return Err(DecodeError::UnknownFieldName(err.to_string()));
                            }
                        }
                    }
                    if !_url_set {
                        return Err(
                            DecodeError::MissingField("url: String.".to_string()),
                        );
                    }
                    Ok(ArgsGet {
                        url: _url,
                        request: _request,
                    })
                }
                pub fn serialize_get_args(
                    args: &ArgsGet,
                ) -> Result<Vec<u8>, EncodeError> {
                    let mut encoder_context = Context::new();
                    encoder_context
                        .description = "Serializing (encoding) imported module-type: get Args"
                        .to_string();
                    let mut encoder = WriteEncoder::new(&[], encoder_context);
                    write_get_args(args, &mut encoder)?;
                    Ok(encoder.get_buffer())
                }
                pub fn write_get_args<W: Write>(
                    args: &ArgsGet,
                    writer: &mut W,
                ) -> Result<(), EncodeError> {
                    writer.write_map_length(&2)?;
                    writer.context().push("url", "String", "writing property");
                    writer.write_string("url")?;
                    writer.write_string(&args.url)?;
                    writer.context().pop();
                    writer
                        .context()
                        .push("request", "Option<HttpHttpRequest>", "writing property");
                    writer.write_string("request")?;
                    if args.request.is_some() {
                        HttpHttpRequest::write(
                            args.request.as_ref().as_ref().unwrap(),
                            writer,
                        )?;
                    } else {
                        writer.write_nil()?;
                    }
                    writer.context().pop();
                    Ok(())
                }
                pub fn serialize_get_result(
                    result: &Option<HttpHttpResponse>,
                ) -> Result<Vec<u8>, EncodeError> {
                    let mut encoder_context = Context::new();
                    encoder_context
                        .description = "Serializing (encoding) imported module-type: get Result"
                        .to_string();
                    let mut encoder = WriteEncoder::new(&[], encoder_context);
                    write_get_result(result, &mut encoder)?;
                    Ok(encoder.get_buffer())
                }
                pub fn write_get_result<W: Write>(
                    result: &Option<HttpHttpResponse>,
                    writer: &mut W,
                ) -> Result<(), EncodeError> {
                    writer
                        .context()
                        .push("get", "Option<HttpHttpResponse>", "writing result");
                    if result.is_some() {
                        HttpHttpResponse::write(result.as_ref().unwrap(), writer)?;
                    } else {
                        writer.write_nil()?;
                    }
                    writer.context().pop();
                    Ok(())
                }
                pub fn deserialize_get_result(
                    result: &[u8],
                ) -> Result<Option<HttpHttpResponse>, DecodeError> {
                    let mut context = Context::new();
                    context
                        .description = "Deserializing imported module-type: get Result"
                        .to_string();
                    let mut reader = ReadDecoder::new(result, context);
                    reader
                        .context()
                        .push(
                            "get",
                            "Option<HttpHttpResponse>",
                            "reading function output",
                        );
                    let mut object: Option<HttpHttpResponse> = None;
                    if !reader.is_next_nil()? {
                        object = Some(HttpHttpResponse::read(&mut reader)?);
                    } else {
                        object = None;
                    }
                    let res = object;
                    reader.context().pop();
                    Ok(res)
                }
                pub struct ArgsPost {
                    pub url: String,
                    pub request: Option<HttpHttpRequest>,
                }
                #[automatically_derived]
                #[allow(unused_qualifications)]
                impl ::core::clone::Clone for ArgsPost {
                    #[inline]
                    fn clone(&self) -> ArgsPost {
                        ArgsPost {
                            url: ::core::clone::Clone::clone(&self.url),
                            request: ::core::clone::Clone::clone(&self.request),
                        }
                    }
                }
                #[automatically_derived]
                #[allow(unused_qualifications)]
                impl ::core::fmt::Debug for ArgsPost {
                    fn fmt(
                        &self,
                        f: &mut ::core::fmt::Formatter,
                    ) -> ::core::fmt::Result {
                        ::core::fmt::Formatter::debug_struct_field2_finish(
                            f,
                            "ArgsPost",
                            "url",
                            &&self.url,
                            "request",
                            &&self.request,
                        )
                    }
                }
                #[doc(hidden)]
                #[allow(
                    non_upper_case_globals,
                    unused_attributes,
                    unused_qualifications
                )]
                const _: () = {
                    #[allow(unused_extern_crates, clippy::useless_attribute)]
                    extern crate serde as _serde;
                    #[automatically_derived]
                    impl<'de> _serde::Deserialize<'de> for ArgsPost {
                        fn deserialize<__D>(
                            __deserializer: __D,
                        ) -> _serde::__private::Result<Self, __D::Error>
                        where
                            __D: _serde::Deserializer<'de>,
                        {
                            #[allow(non_camel_case_types)]
                            enum __Field {
                                __field0,
                                __field1,
                                __ignore,
                            }
                            struct __FieldVisitor;
                            impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                                type Value = __Field;
                                fn expecting(
                                    &self,
                                    __formatter: &mut _serde::__private::Formatter,
                                ) -> _serde::__private::fmt::Result {
                                    _serde::__private::Formatter::write_str(
                                        __formatter,
                                        "field identifier",
                                    )
                                }
                                fn visit_u64<__E>(
                                    self,
                                    __value: u64,
                                ) -> _serde::__private::Result<Self::Value, __E>
                                where
                                    __E: _serde::de::Error,
                                {
                                    match __value {
                                        0u64 => _serde::__private::Ok(__Field::__field0),
                                        1u64 => _serde::__private::Ok(__Field::__field1),
                                        _ => _serde::__private::Ok(__Field::__ignore),
                                    }
                                }
                                fn visit_str<__E>(
                                    self,
                                    __value: &str,
                                ) -> _serde::__private::Result<Self::Value, __E>
                                where
                                    __E: _serde::de::Error,
                                {
                                    match __value {
                                        "url" => _serde::__private::Ok(__Field::__field0),
                                        "request" => _serde::__private::Ok(__Field::__field1),
                                        _ => _serde::__private::Ok(__Field::__ignore),
                                    }
                                }
                                fn visit_bytes<__E>(
                                    self,
                                    __value: &[u8],
                                ) -> _serde::__private::Result<Self::Value, __E>
                                where
                                    __E: _serde::de::Error,
                                {
                                    match __value {
                                        b"url" => _serde::__private::Ok(__Field::__field0),
                                        b"request" => _serde::__private::Ok(__Field::__field1),
                                        _ => _serde::__private::Ok(__Field::__ignore),
                                    }
                                }
                            }
                            impl<'de> _serde::Deserialize<'de> for __Field {
                                #[inline]
                                fn deserialize<__D>(
                                    __deserializer: __D,
                                ) -> _serde::__private::Result<Self, __D::Error>
                                where
                                    __D: _serde::Deserializer<'de>,
                                {
                                    _serde::Deserializer::deserialize_identifier(
                                        __deserializer,
                                        __FieldVisitor,
                                    )
                                }
                            }
                            struct __Visitor<'de> {
                                marker: _serde::__private::PhantomData<ArgsPost>,
                                lifetime: _serde::__private::PhantomData<&'de ()>,
                            }
                            impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                                type Value = ArgsPost;
                                fn expecting(
                                    &self,
                                    __formatter: &mut _serde::__private::Formatter,
                                ) -> _serde::__private::fmt::Result {
                                    _serde::__private::Formatter::write_str(
                                        __formatter,
                                        "struct ArgsPost",
                                    )
                                }
                                #[inline]
                                fn visit_seq<__A>(
                                    self,
                                    mut __seq: __A,
                                ) -> _serde::__private::Result<Self::Value, __A::Error>
                                where
                                    __A: _serde::de::SeqAccess<'de>,
                                {
                                    let __field0 = match match _serde::de::SeqAccess::next_element::<
                                        String,
                                    >(&mut __seq) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    } {
                                        _serde::__private::Some(__value) => __value,
                                        _serde::__private::None => {
                                            return _serde::__private::Err(
                                                _serde::de::Error::invalid_length(
                                                    0usize,
                                                    &"struct ArgsPost with 2 elements",
                                                ),
                                            );
                                        }
                                    };
                                    let __field1 = match match _serde::de::SeqAccess::next_element::<
                                        Option<HttpHttpRequest>,
                                    >(&mut __seq) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    } {
                                        _serde::__private::Some(__value) => __value,
                                        _serde::__private::None => {
                                            return _serde::__private::Err(
                                                _serde::de::Error::invalid_length(
                                                    1usize,
                                                    &"struct ArgsPost with 2 elements",
                                                ),
                                            );
                                        }
                                    };
                                    _serde::__private::Ok(ArgsPost {
                                        url: __field0,
                                        request: __field1,
                                    })
                                }
                                #[inline]
                                fn visit_map<__A>(
                                    self,
                                    mut __map: __A,
                                ) -> _serde::__private::Result<Self::Value, __A::Error>
                                where
                                    __A: _serde::de::MapAccess<'de>,
                                {
                                    let mut __field0: _serde::__private::Option<String> = _serde::__private::None;
                                    let mut __field1: _serde::__private::Option<
                                        Option<HttpHttpRequest>,
                                    > = _serde::__private::None;
                                    while let _serde::__private::Some(__key)
                                        = match _serde::de::MapAccess::next_key::<
                                            __Field,
                                        >(&mut __map) {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        } {
                                        match __key {
                                            __Field::__field0 => {
                                                if _serde::__private::Option::is_some(&__field0) {
                                                    return _serde::__private::Err(
                                                        <__A::Error as _serde::de::Error>::duplicate_field("url"),
                                                    );
                                                }
                                                __field0 = _serde::__private::Some(
                                                    match _serde::de::MapAccess::next_value::<
                                                        String,
                                                    >(&mut __map) {
                                                        _serde::__private::Ok(__val) => __val,
                                                        _serde::__private::Err(__err) => {
                                                            return _serde::__private::Err(__err);
                                                        }
                                                    },
                                                );
                                            }
                                            __Field::__field1 => {
                                                if _serde::__private::Option::is_some(&__field1) {
                                                    return _serde::__private::Err(
                                                        <__A::Error as _serde::de::Error>::duplicate_field(
                                                            "request",
                                                        ),
                                                    );
                                                }
                                                __field1 = _serde::__private::Some(
                                                    match _serde::de::MapAccess::next_value::<
                                                        Option<HttpHttpRequest>,
                                                    >(&mut __map) {
                                                        _serde::__private::Ok(__val) => __val,
                                                        _serde::__private::Err(__err) => {
                                                            return _serde::__private::Err(__err);
                                                        }
                                                    },
                                                );
                                            }
                                            _ => {
                                                let _ = match _serde::de::MapAccess::next_value::<
                                                    _serde::de::IgnoredAny,
                                                >(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                };
                                            }
                                        }
                                    }
                                    let __field0 = match __field0 {
                                        _serde::__private::Some(__field0) => __field0,
                                        _serde::__private::None => {
                                            match _serde::__private::de::missing_field("url") {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            }
                                        }
                                    };
                                    let __field1 = match __field1 {
                                        _serde::__private::Some(__field1) => __field1,
                                        _serde::__private::None => {
                                            match _serde::__private::de::missing_field("request") {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            }
                                        }
                                    };
                                    _serde::__private::Ok(ArgsPost {
                                        url: __field0,
                                        request: __field1,
                                    })
                                }
                            }
                            const FIELDS: &'static [&'static str] = &["url", "request"];
                            _serde::Deserializer::deserialize_struct(
                                __deserializer,
                                "ArgsPost",
                                FIELDS,
                                __Visitor {
                                    marker: _serde::__private::PhantomData::<ArgsPost>,
                                    lifetime: _serde::__private::PhantomData,
                                },
                            )
                        }
                    }
                };
                #[doc(hidden)]
                #[allow(
                    non_upper_case_globals,
                    unused_attributes,
                    unused_qualifications
                )]
                const _: () = {
                    #[allow(unused_extern_crates, clippy::useless_attribute)]
                    extern crate serde as _serde;
                    #[automatically_derived]
                    impl _serde::Serialize for ArgsPost {
                        fn serialize<__S>(
                            &self,
                            __serializer: __S,
                        ) -> _serde::__private::Result<__S::Ok, __S::Error>
                        where
                            __S: _serde::Serializer,
                        {
                            let mut __serde_state = match _serde::Serializer::serialize_struct(
                                __serializer,
                                "ArgsPost",
                                false as usize + 1 + 1,
                            ) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            };
                            match _serde::ser::SerializeStruct::serialize_field(
                                &mut __serde_state,
                                "url",
                                &self.url,
                            ) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            };
                            match _serde::ser::SerializeStruct::serialize_field(
                                &mut __serde_state,
                                "request",
                                &self.request,
                            ) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            };
                            _serde::ser::SerializeStruct::end(__serde_state)
                        }
                    }
                };
                pub fn deserialize_post_args(
                    args: &[u8],
                ) -> Result<ArgsPost, DecodeError> {
                    let mut context = Context::new();
                    context
                        .description = "Deserializing imported module-type: post Args"
                        .to_string();
                    let mut reader = ReadDecoder::new(args, context);
                    let mut num_of_fields = reader.read_map_length()?;
                    let mut _url: String = String::new();
                    let mut _url_set = false;
                    let mut _request: Option<HttpHttpRequest> = None;
                    while num_of_fields > 0 {
                        num_of_fields -= 1;
                        let field = reader.read_string()?;
                        match field.as_str() {
                            "url" => {
                                reader
                                    .context()
                                    .push(&field, "String", "type found, reading argument");
                                _url = reader.read_string()?;
                                _url_set = true;
                                reader.context().pop();
                            }
                            "request" => {
                                reader
                                    .context()
                                    .push(
                                        &field,
                                        "Option<HttpHttpRequest>",
                                        "type found, reading argument",
                                    );
                                let mut object: Option<HttpHttpRequest> = None;
                                if !reader.is_next_nil()? {
                                    object = Some(HttpHttpRequest::read(&mut reader)?);
                                } else {
                                    object = None;
                                }
                                _request = object;
                                reader.context().pop();
                            }
                            err => {
                                return Err(DecodeError::UnknownFieldName(err.to_string()));
                            }
                        }
                    }
                    if !_url_set {
                        return Err(
                            DecodeError::MissingField("url: String.".to_string()),
                        );
                    }
                    Ok(ArgsPost {
                        url: _url,
                        request: _request,
                    })
                }
                pub fn serialize_post_args(
                    args: &ArgsPost,
                ) -> Result<Vec<u8>, EncodeError> {
                    let mut encoder_context = Context::new();
                    encoder_context
                        .description = "Serializing (encoding) imported module-type: post Args"
                        .to_string();
                    let mut encoder = WriteEncoder::new(&[], encoder_context);
                    write_post_args(args, &mut encoder)?;
                    Ok(encoder.get_buffer())
                }
                pub fn write_post_args<W: Write>(
                    args: &ArgsPost,
                    writer: &mut W,
                ) -> Result<(), EncodeError> {
                    writer.write_map_length(&2)?;
                    writer.context().push("url", "String", "writing property");
                    writer.write_string("url")?;
                    writer.write_string(&args.url)?;
                    writer.context().pop();
                    writer
                        .context()
                        .push("request", "Option<HttpHttpRequest>", "writing property");
                    writer.write_string("request")?;
                    if args.request.is_some() {
                        HttpHttpRequest::write(
                            args.request.as_ref().as_ref().unwrap(),
                            writer,
                        )?;
                    } else {
                        writer.write_nil()?;
                    }
                    writer.context().pop();
                    Ok(())
                }
                pub fn serialize_post_result(
                    result: &Option<HttpHttpResponse>,
                ) -> Result<Vec<u8>, EncodeError> {
                    let mut encoder_context = Context::new();
                    encoder_context
                        .description = "Serializing (encoding) imported module-type: post Result"
                        .to_string();
                    let mut encoder = WriteEncoder::new(&[], encoder_context);
                    write_post_result(result, &mut encoder)?;
                    Ok(encoder.get_buffer())
                }
                pub fn write_post_result<W: Write>(
                    result: &Option<HttpHttpResponse>,
                    writer: &mut W,
                ) -> Result<(), EncodeError> {
                    writer
                        .context()
                        .push("post", "Option<HttpHttpResponse>", "writing result");
                    if result.is_some() {
                        HttpHttpResponse::write(result.as_ref().unwrap(), writer)?;
                    } else {
                        writer.write_nil()?;
                    }
                    writer.context().pop();
                    Ok(())
                }
                pub fn deserialize_post_result(
                    result: &[u8],
                ) -> Result<Option<HttpHttpResponse>, DecodeError> {
                    let mut context = Context::new();
                    context
                        .description = "Deserializing imported module-type: post Result"
                        .to_string();
                    let mut reader = ReadDecoder::new(result, context);
                    reader
                        .context()
                        .push(
                            "post",
                            "Option<HttpHttpResponse>",
                            "reading function output",
                        );
                    let mut object: Option<HttpHttpResponse> = None;
                    if !reader.is_next_nil()? {
                        object = Some(HttpHttpResponse::read(&mut reader)?);
                    } else {
                        object = None;
                    }
                    let res = object;
                    reader.context().pop();
                    Ok(res)
                }
            }
            pub use serialization::{
                deserialize_get_result, serialize_get_args, ArgsGet,
                deserialize_post_result, serialize_post_args, ArgsPost,
            };
            use crate::HttpHttpRequest;
            use crate::HttpHttpResponse;
            pub struct HttpModule {}
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::clone::Clone for HttpModule {
                #[inline]
                fn clone(&self) -> HttpModule {
                    HttpModule {}
                }
            }
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::fmt::Debug for HttpModule {
                fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                    ::core::fmt::Formatter::write_str(f, "HttpModule")
                }
            }
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl<'de> _serde::Deserialize<'de> for HttpModule {
                    fn deserialize<__D>(
                        __deserializer: __D,
                    ) -> _serde::__private::Result<Self, __D::Error>
                    where
                        __D: _serde::Deserializer<'de>,
                    {
                        #[allow(non_camel_case_types)]
                        enum __Field {
                            __ignore,
                        }
                        struct __FieldVisitor;
                        impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                            type Value = __Field;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "field identifier",
                                )
                            }
                            fn visit_u64<__E>(
                                self,
                                __value: u64,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                            fn visit_str<__E>(
                                self,
                                __value: &str,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                            fn visit_bytes<__E>(
                                self,
                                __value: &[u8],
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                        }
                        impl<'de> _serde::Deserialize<'de> for __Field {
                            #[inline]
                            fn deserialize<__D>(
                                __deserializer: __D,
                            ) -> _serde::__private::Result<Self, __D::Error>
                            where
                                __D: _serde::Deserializer<'de>,
                            {
                                _serde::Deserializer::deserialize_identifier(
                                    __deserializer,
                                    __FieldVisitor,
                                )
                            }
                        }
                        struct __Visitor<'de> {
                            marker: _serde::__private::PhantomData<HttpModule>,
                            lifetime: _serde::__private::PhantomData<&'de ()>,
                        }
                        impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                            type Value = HttpModule;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "struct HttpModule",
                                )
                            }
                            #[inline]
                            fn visit_seq<__A>(
                                self,
                                _: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::SeqAccess<'de>,
                            {
                                _serde::__private::Ok(HttpModule {})
                            }
                            #[inline]
                            fn visit_map<__A>(
                                self,
                                mut __map: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::MapAccess<'de>,
                            {
                                while let _serde::__private::Some(__key)
                                    = match _serde::de::MapAccess::next_key::<
                                        __Field,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    } {
                                    match __key {
                                        _ => {
                                            let _ = match _serde::de::MapAccess::next_value::<
                                                _serde::de::IgnoredAny,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            };
                                        }
                                    }
                                }
                                _serde::__private::Ok(HttpModule {})
                            }
                        }
                        const FIELDS: &'static [&'static str] = &[];
                        _serde::Deserializer::deserialize_struct(
                            __deserializer,
                            "HttpModule",
                            FIELDS,
                            __Visitor {
                                marker: _serde::__private::PhantomData::<HttpModule>,
                                lifetime: _serde::__private::PhantomData,
                            },
                        )
                    }
                }
            };
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl _serde::Serialize for HttpModule {
                    fn serialize<__S>(
                        &self,
                        __serializer: __S,
                    ) -> _serde::__private::Result<__S::Ok, __S::Error>
                    where
                        __S: _serde::Serializer,
                    {
                        let __serde_state = match _serde::Serializer::serialize_struct(
                            __serializer,
                            "HttpModule",
                            false as usize,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        _serde::ser::SerializeStruct::end(__serde_state)
                    }
                }
            };
            impl HttpModule {
                pub const URI: &'static str = "wrap://ens/http.polywrap.eth";
                pub fn new() -> HttpModule {
                    HttpModule {}
                }
                pub fn get(args: &ArgsGet) -> Result<Option<HttpHttpResponse>, String> {
                    let uri = HttpModule::URI;
                    let args = serialize_get_args(args).map_err(|e| e.to_string())?;
                    let result = subinvoke::wrap_subinvoke(uri, "get", args)?;
                    deserialize_get_result(result.as_slice()).map_err(|e| e.to_string())
                }
                pub fn post(
                    args: &ArgsPost,
                ) -> Result<Option<HttpHttpResponse>, String> {
                    let uri = HttpModule::URI;
                    let args = serialize_post_args(args).map_err(|e| e.to_string())?;
                    let result = subinvoke::wrap_subinvoke(uri, "post", args)?;
                    deserialize_post_result(result.as_slice()).map_err(|e| e.to_string())
                }
            }
        }
        pub use http_module::*;
    }
    pub use imported::http_http_request::HttpHttpRequest;
    pub use imported::http_http_response::HttpHttpResponse;
    pub use imported::http_http_response_type::{
        get_http_http_response_type_key, get_http_http_response_type_value,
        sanitize_http_http_response_type_value, HttpHttpResponseType,
    };
    pub use imported::http_module::HttpModule;
    pub mod module {
        pub mod wrapped {
            use polywrap_wasm_rs::wrap_load_env;
            use crate::{
                get_metadata, ArgsGetMetadata, deserialize_get_metadata_args,
                serialize_get_metadata_result, quote, ArgsQuote, deserialize_quote_args,
                serialize_quote_result,
            };
            pub fn get_metadata_wrapped(args: &[u8], env_size: u32) -> Vec<u8> {
                let result = get_metadata(ArgsGetMetadata {});
                serialize_get_metadata_result(&result).unwrap()
            }
            pub fn quote_wrapped(args: &[u8], env_size: u32) -> Vec<u8> {
                match deserialize_quote_args(args) {
                    Ok(args) => {
                        let result = quote(ArgsQuote { request: args.request });
                        serialize_quote_result(&result).unwrap()
                    }
                    Err(e) => ::core::panicking::panic_display(&e.to_string()),
                }
            }
        }
        pub use wrapped::{get_metadata_wrapped, quote_wrapped};
        pub mod serialization {
            use serde::{Serialize, Deserialize};
            use std::convert::TryFrom;
            use polywrap_wasm_rs::{
                BigInt, BigNumber, Map, Context, DecodeError, EncodeError, Read,
                ReadDecoder, Write, WriteEncoder, JSON,
            };
            use crate::Metadata;
            use crate::QuoteRequest;
            use crate::QuoteResponse;
            pub struct ArgsGetMetadata {}
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::clone::Clone for ArgsGetMetadata {
                #[inline]
                fn clone(&self) -> ArgsGetMetadata {
                    ArgsGetMetadata {}
                }
            }
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::fmt::Debug for ArgsGetMetadata {
                fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                    ::core::fmt::Formatter::write_str(f, "ArgsGetMetadata")
                }
            }
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl<'de> _serde::Deserialize<'de> for ArgsGetMetadata {
                    fn deserialize<__D>(
                        __deserializer: __D,
                    ) -> _serde::__private::Result<Self, __D::Error>
                    where
                        __D: _serde::Deserializer<'de>,
                    {
                        #[allow(non_camel_case_types)]
                        enum __Field {
                            __ignore,
                        }
                        struct __FieldVisitor;
                        impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                            type Value = __Field;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "field identifier",
                                )
                            }
                            fn visit_u64<__E>(
                                self,
                                __value: u64,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                            fn visit_str<__E>(
                                self,
                                __value: &str,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                            fn visit_bytes<__E>(
                                self,
                                __value: &[u8],
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                        }
                        impl<'de> _serde::Deserialize<'de> for __Field {
                            #[inline]
                            fn deserialize<__D>(
                                __deserializer: __D,
                            ) -> _serde::__private::Result<Self, __D::Error>
                            where
                                __D: _serde::Deserializer<'de>,
                            {
                                _serde::Deserializer::deserialize_identifier(
                                    __deserializer,
                                    __FieldVisitor,
                                )
                            }
                        }
                        struct __Visitor<'de> {
                            marker: _serde::__private::PhantomData<ArgsGetMetadata>,
                            lifetime: _serde::__private::PhantomData<&'de ()>,
                        }
                        impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                            type Value = ArgsGetMetadata;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "struct ArgsGetMetadata",
                                )
                            }
                            #[inline]
                            fn visit_seq<__A>(
                                self,
                                _: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::SeqAccess<'de>,
                            {
                                _serde::__private::Ok(ArgsGetMetadata {})
                            }
                            #[inline]
                            fn visit_map<__A>(
                                self,
                                mut __map: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::MapAccess<'de>,
                            {
                                while let _serde::__private::Some(__key)
                                    = match _serde::de::MapAccess::next_key::<
                                        __Field,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    } {
                                    match __key {
                                        _ => {
                                            let _ = match _serde::de::MapAccess::next_value::<
                                                _serde::de::IgnoredAny,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            };
                                        }
                                    }
                                }
                                _serde::__private::Ok(ArgsGetMetadata {})
                            }
                        }
                        const FIELDS: &'static [&'static str] = &[];
                        _serde::Deserializer::deserialize_struct(
                            __deserializer,
                            "ArgsGetMetadata",
                            FIELDS,
                            __Visitor {
                                marker: _serde::__private::PhantomData::<ArgsGetMetadata>,
                                lifetime: _serde::__private::PhantomData,
                            },
                        )
                    }
                }
            };
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl _serde::Serialize for ArgsGetMetadata {
                    fn serialize<__S>(
                        &self,
                        __serializer: __S,
                    ) -> _serde::__private::Result<__S::Ok, __S::Error>
                    where
                        __S: _serde::Serializer,
                    {
                        let __serde_state = match _serde::Serializer::serialize_struct(
                            __serializer,
                            "ArgsGetMetadata",
                            false as usize,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        _serde::ser::SerializeStruct::end(__serde_state)
                    }
                }
            };
            pub fn deserialize_get_metadata_args(
                args: &[u8],
            ) -> Result<ArgsGetMetadata, DecodeError> {
                let mut context = Context::new();
                context
                    .description = "Deserializing module-type: get_metadata Args"
                    .to_string();
                Ok(ArgsGetMetadata {})
            }
            pub fn serialize_get_metadata_args(
                args: &ArgsGetMetadata,
            ) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) module-type: get_metadata Args"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_get_metadata_args(args, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_get_metadata_args<W: Write>(
                args: &ArgsGetMetadata,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.write_map_length(&0)?;
                Ok(())
            }
            pub fn serialize_get_metadata_result(
                result: &Metadata,
            ) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) module-type: get_metadata Result"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_get_metadata_result(result, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_get_metadata_result<W: Write>(
                result: &Metadata,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.context().push("getMetadata", "Metadata", "writing result");
                Metadata::write(&result, writer)?;
                writer.context().pop();
                Ok(())
            }
            pub fn deserialize_get_metadata_result(
                result: &[u8],
            ) -> Result<Metadata, DecodeError> {
                let mut context = Context::new();
                context
                    .description = "Deserializing module-type: get_metadata Result"
                    .to_string();
                let mut reader = ReadDecoder::new(result, context);
                reader
                    .context()
                    .push("getMetadata", "Metadata", "reading function output");
                let object = Metadata::read(&mut reader)?;
                let res = object;
                reader.context().pop();
                Ok(res)
            }
            pub struct ArgsQuote {
                pub request: QuoteRequest,
            }
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::clone::Clone for ArgsQuote {
                #[inline]
                fn clone(&self) -> ArgsQuote {
                    ArgsQuote {
                        request: ::core::clone::Clone::clone(&self.request),
                    }
                }
            }
            #[automatically_derived]
            #[allow(unused_qualifications)]
            impl ::core::fmt::Debug for ArgsQuote {
                fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                    ::core::fmt::Formatter::debug_struct_field1_finish(
                        f,
                        "ArgsQuote",
                        "request",
                        &&self.request,
                    )
                }
            }
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl<'de> _serde::Deserialize<'de> for ArgsQuote {
                    fn deserialize<__D>(
                        __deserializer: __D,
                    ) -> _serde::__private::Result<Self, __D::Error>
                    where
                        __D: _serde::Deserializer<'de>,
                    {
                        #[allow(non_camel_case_types)]
                        enum __Field {
                            __field0,
                            __ignore,
                        }
                        struct __FieldVisitor;
                        impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                            type Value = __Field;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "field identifier",
                                )
                            }
                            fn visit_u64<__E>(
                                self,
                                __value: u64,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    0u64 => _serde::__private::Ok(__Field::__field0),
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                            fn visit_str<__E>(
                                self,
                                __value: &str,
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    "request" => _serde::__private::Ok(__Field::__field0),
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                            fn visit_bytes<__E>(
                                self,
                                __value: &[u8],
                            ) -> _serde::__private::Result<Self::Value, __E>
                            where
                                __E: _serde::de::Error,
                            {
                                match __value {
                                    b"request" => _serde::__private::Ok(__Field::__field0),
                                    _ => _serde::__private::Ok(__Field::__ignore),
                                }
                            }
                        }
                        impl<'de> _serde::Deserialize<'de> for __Field {
                            #[inline]
                            fn deserialize<__D>(
                                __deserializer: __D,
                            ) -> _serde::__private::Result<Self, __D::Error>
                            where
                                __D: _serde::Deserializer<'de>,
                            {
                                _serde::Deserializer::deserialize_identifier(
                                    __deserializer,
                                    __FieldVisitor,
                                )
                            }
                        }
                        struct __Visitor<'de> {
                            marker: _serde::__private::PhantomData<ArgsQuote>,
                            lifetime: _serde::__private::PhantomData<&'de ()>,
                        }
                        impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                            type Value = ArgsQuote;
                            fn expecting(
                                &self,
                                __formatter: &mut _serde::__private::Formatter,
                            ) -> _serde::__private::fmt::Result {
                                _serde::__private::Formatter::write_str(
                                    __formatter,
                                    "struct ArgsQuote",
                                )
                            }
                            #[inline]
                            fn visit_seq<__A>(
                                self,
                                mut __seq: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::SeqAccess<'de>,
                            {
                                let __field0 = match match _serde::de::SeqAccess::next_element::<
                                    QuoteRequest,
                                >(&mut __seq) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                } {
                                    _serde::__private::Some(__value) => __value,
                                    _serde::__private::None => {
                                        return _serde::__private::Err(
                                            _serde::de::Error::invalid_length(
                                                0usize,
                                                &"struct ArgsQuote with 1 element",
                                            ),
                                        );
                                    }
                                };
                                _serde::__private::Ok(ArgsQuote { request: __field0 })
                            }
                            #[inline]
                            fn visit_map<__A>(
                                self,
                                mut __map: __A,
                            ) -> _serde::__private::Result<Self::Value, __A::Error>
                            where
                                __A: _serde::de::MapAccess<'de>,
                            {
                                let mut __field0: _serde::__private::Option<QuoteRequest> = _serde::__private::None;
                                while let _serde::__private::Some(__key)
                                    = match _serde::de::MapAccess::next_key::<
                                        __Field,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    } {
                                    match __key {
                                        __Field::__field0 => {
                                            if _serde::__private::Option::is_some(&__field0) {
                                                return _serde::__private::Err(
                                                    <__A::Error as _serde::de::Error>::duplicate_field(
                                                        "request",
                                                    ),
                                                );
                                            }
                                            __field0 = _serde::__private::Some(
                                                match _serde::de::MapAccess::next_value::<
                                                    QuoteRequest,
                                                >(&mut __map) {
                                                    _serde::__private::Ok(__val) => __val,
                                                    _serde::__private::Err(__err) => {
                                                        return _serde::__private::Err(__err);
                                                    }
                                                },
                                            );
                                        }
                                        _ => {
                                            let _ = match _serde::de::MapAccess::next_value::<
                                                _serde::de::IgnoredAny,
                                            >(&mut __map) {
                                                _serde::__private::Ok(__val) => __val,
                                                _serde::__private::Err(__err) => {
                                                    return _serde::__private::Err(__err);
                                                }
                                            };
                                        }
                                    }
                                }
                                let __field0 = match __field0 {
                                    _serde::__private::Some(__field0) => __field0,
                                    _serde::__private::None => {
                                        match _serde::__private::de::missing_field("request") {
                                            _serde::__private::Ok(__val) => __val,
                                            _serde::__private::Err(__err) => {
                                                return _serde::__private::Err(__err);
                                            }
                                        }
                                    }
                                };
                                _serde::__private::Ok(ArgsQuote { request: __field0 })
                            }
                        }
                        const FIELDS: &'static [&'static str] = &["request"];
                        _serde::Deserializer::deserialize_struct(
                            __deserializer,
                            "ArgsQuote",
                            FIELDS,
                            __Visitor {
                                marker: _serde::__private::PhantomData::<ArgsQuote>,
                                lifetime: _serde::__private::PhantomData,
                            },
                        )
                    }
                }
            };
            #[doc(hidden)]
            #[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
            const _: () = {
                #[allow(unused_extern_crates, clippy::useless_attribute)]
                extern crate serde as _serde;
                #[automatically_derived]
                impl _serde::Serialize for ArgsQuote {
                    fn serialize<__S>(
                        &self,
                        __serializer: __S,
                    ) -> _serde::__private::Result<__S::Ok, __S::Error>
                    where
                        __S: _serde::Serializer,
                    {
                        let mut __serde_state = match _serde::Serializer::serialize_struct(
                            __serializer,
                            "ArgsQuote",
                            false as usize + 1,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        match _serde::ser::SerializeStruct::serialize_field(
                            &mut __serde_state,
                            "request",
                            &self.request,
                        ) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        };
                        _serde::ser::SerializeStruct::end(__serde_state)
                    }
                }
            };
            pub fn deserialize_quote_args(
                args: &[u8],
            ) -> Result<ArgsQuote, DecodeError> {
                let mut context = Context::new();
                context
                    .description = "Deserializing module-type: quote Args".to_string();
                let mut reader = ReadDecoder::new(args, context);
                let mut num_of_fields = reader.read_map_length()?;
                let mut _request: QuoteRequest = QuoteRequest::new();
                let mut _request_set = false;
                while num_of_fields > 0 {
                    num_of_fields -= 1;
                    let field = reader.read_string()?;
                    match field.as_str() {
                        "request" => {
                            reader
                                .context()
                                .push(
                                    &field,
                                    "QuoteRequest",
                                    "type found, reading argument",
                                );
                            let object = QuoteRequest::read(&mut reader)?;
                            _request = object;
                            _request_set = true;
                            reader.context().pop();
                        }
                        err => return Err(DecodeError::UnknownFieldName(err.to_string())),
                    }
                }
                if !_request_set {
                    return Err(
                        DecodeError::MissingField("request: QuoteRequest.".to_string()),
                    );
                }
                Ok(ArgsQuote { request: _request })
            }
            pub fn serialize_quote_args(
                args: &ArgsQuote,
            ) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) module-type: quote Args"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_quote_args(args, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_quote_args<W: Write>(
                args: &ArgsQuote,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.write_map_length(&1)?;
                writer.context().push("request", "QuoteRequest", "writing property");
                writer.write_string("request")?;
                QuoteRequest::write(&args.request, writer)?;
                writer.context().pop();
                Ok(())
            }
            pub fn serialize_quote_result(
                result: &QuoteResponse,
            ) -> Result<Vec<u8>, EncodeError> {
                let mut encoder_context = Context::new();
                encoder_context
                    .description = "Serializing (encoding) module-type: quote Result"
                    .to_string();
                let mut encoder = WriteEncoder::new(&[], encoder_context);
                write_quote_result(result, &mut encoder)?;
                Ok(encoder.get_buffer())
            }
            pub fn write_quote_result<W: Write>(
                result: &QuoteResponse,
                writer: &mut W,
            ) -> Result<(), EncodeError> {
                writer.context().push("quote", "QuoteResponse", "writing result");
                QuoteResponse::write(&result, writer)?;
                writer.context().pop();
                Ok(())
            }
            pub fn deserialize_quote_result(
                result: &[u8],
            ) -> Result<QuoteResponse, DecodeError> {
                let mut context = Context::new();
                context
                    .description = "Deserializing module-type: quote Result".to_string();
                let mut reader = ReadDecoder::new(result, context);
                reader
                    .context()
                    .push("quote", "QuoteResponse", "reading function output");
                let object = QuoteResponse::read(&mut reader)?;
                let res = object;
                reader.context().pop();
                Ok(res)
            }
        }
        pub use serialization::{
            deserialize_get_metadata_args, serialize_get_metadata_result,
            ArgsGetMetadata, deserialize_quote_args, serialize_quote_result, ArgsQuote,
        };
    }
    pub use module::{
        deserialize_get_metadata_args, serialize_get_metadata_result,
        get_metadata_wrapped, ArgsGetMetadata, deserialize_quote_args,
        serialize_quote_result, quote_wrapped, ArgsQuote,
    };
}
use polywrap_wasm_rs::JSON;
pub use wrap::*;
use crate::imported::http_module;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
struct MetadataResponse {
    blockchains: Vec<Blockchain>,
}
#[doc(hidden)]
#[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
const _: () = {
    #[allow(unused_extern_crates, clippy::useless_attribute)]
    extern crate serde as _serde;
    #[automatically_derived]
    impl _serde::Serialize for MetadataResponse {
        fn serialize<__S>(
            &self,
            __serializer: __S,
        ) -> _serde::__private::Result<__S::Ok, __S::Error>
        where
            __S: _serde::Serializer,
        {
            let mut __serde_state = match _serde::Serializer::serialize_struct(
                __serializer,
                "MetadataResponse",
                false as usize + 1,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "blockchains",
                &self.blockchains,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            _serde::ser::SerializeStruct::end(__serde_state)
        }
    }
};
#[doc(hidden)]
#[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
const _: () = {
    #[allow(unused_extern_crates, clippy::useless_attribute)]
    extern crate serde as _serde;
    #[automatically_derived]
    impl<'de> _serde::Deserialize<'de> for MetadataResponse {
        fn deserialize<__D>(
            __deserializer: __D,
        ) -> _serde::__private::Result<Self, __D::Error>
        where
            __D: _serde::Deserializer<'de>,
        {
            #[allow(non_camel_case_types)]
            enum __Field {
                __field0,
                __ignore,
            }
            struct __FieldVisitor;
            impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                type Value = __Field;
                fn expecting(
                    &self,
                    __formatter: &mut _serde::__private::Formatter,
                ) -> _serde::__private::fmt::Result {
                    _serde::__private::Formatter::write_str(
                        __formatter,
                        "field identifier",
                    )
                }
                fn visit_u64<__E>(
                    self,
                    __value: u64,
                ) -> _serde::__private::Result<Self::Value, __E>
                where
                    __E: _serde::de::Error,
                {
                    match __value {
                        0u64 => _serde::__private::Ok(__Field::__field0),
                        _ => _serde::__private::Ok(__Field::__ignore),
                    }
                }
                fn visit_str<__E>(
                    self,
                    __value: &str,
                ) -> _serde::__private::Result<Self::Value, __E>
                where
                    __E: _serde::de::Error,
                {
                    match __value {
                        "blockchains" => _serde::__private::Ok(__Field::__field0),
                        _ => _serde::__private::Ok(__Field::__ignore),
                    }
                }
                fn visit_bytes<__E>(
                    self,
                    __value: &[u8],
                ) -> _serde::__private::Result<Self::Value, __E>
                where
                    __E: _serde::de::Error,
                {
                    match __value {
                        b"blockchains" => _serde::__private::Ok(__Field::__field0),
                        _ => _serde::__private::Ok(__Field::__ignore),
                    }
                }
            }
            impl<'de> _serde::Deserialize<'de> for __Field {
                #[inline]
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    _serde::Deserializer::deserialize_identifier(
                        __deserializer,
                        __FieldVisitor,
                    )
                }
            }
            struct __Visitor<'de> {
                marker: _serde::__private::PhantomData<MetadataResponse>,
                lifetime: _serde::__private::PhantomData<&'de ()>,
            }
            impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                type Value = MetadataResponse;
                fn expecting(
                    &self,
                    __formatter: &mut _serde::__private::Formatter,
                ) -> _serde::__private::fmt::Result {
                    _serde::__private::Formatter::write_str(
                        __formatter,
                        "struct MetadataResponse",
                    )
                }
                #[inline]
                fn visit_seq<__A>(
                    self,
                    mut __seq: __A,
                ) -> _serde::__private::Result<Self::Value, __A::Error>
                where
                    __A: _serde::de::SeqAccess<'de>,
                {
                    let __field0 = match match _serde::de::SeqAccess::next_element::<
                        Vec<Blockchain>,
                    >(&mut __seq) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    } {
                        _serde::__private::Some(__value) => __value,
                        _serde::__private::None => {
                            return _serde::__private::Err(
                                _serde::de::Error::invalid_length(
                                    0usize,
                                    &"struct MetadataResponse with 1 element",
                                ),
                            );
                        }
                    };
                    _serde::__private::Ok(MetadataResponse {
                        blockchains: __field0,
                    })
                }
                #[inline]
                fn visit_map<__A>(
                    self,
                    mut __map: __A,
                ) -> _serde::__private::Result<Self::Value, __A::Error>
                where
                    __A: _serde::de::MapAccess<'de>,
                {
                    let mut __field0: _serde::__private::Option<Vec<Blockchain>> = _serde::__private::None;
                    while let _serde::__private::Some(__key)
                        = match _serde::de::MapAccess::next_key::<__Field>(&mut __map) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        } {
                        match __key {
                            __Field::__field0 => {
                                if _serde::__private::Option::is_some(&__field0) {
                                    return _serde::__private::Err(
                                        <__A::Error as _serde::de::Error>::duplicate_field(
                                            "blockchains",
                                        ),
                                    );
                                }
                                __field0 = _serde::__private::Some(
                                    match _serde::de::MapAccess::next_value::<
                                        Vec<Blockchain>,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    },
                                );
                            }
                            _ => {
                                let _ = match _serde::de::MapAccess::next_value::<
                                    _serde::de::IgnoredAny,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                };
                            }
                        }
                    }
                    let __field0 = match __field0 {
                        _serde::__private::Some(__field0) => __field0,
                        _serde::__private::None => {
                            match _serde::__private::de::missing_field("blockchains") {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            }
                        }
                    };
                    _serde::__private::Ok(MetadataResponse {
                        blockchains: __field0,
                    })
                }
            }
            const FIELDS: &'static [&'static str] = &["blockchains"];
            _serde::Deserializer::deserialize_struct(
                __deserializer,
                "MetadataResponse",
                FIELDS,
                __Visitor {
                    marker: _serde::__private::PhantomData::<MetadataResponse>,
                    lifetime: _serde::__private::PhantomData,
                },
            )
        }
    }
};
struct Blockchain {
    name: String,
    displayName: String,
    chainId: Option<String>,
    defaultDecimals: i8,
    type_: String,
    logo: String,
    info: Option<ChainInfo>,
}
#[doc(hidden)]
#[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
const _: () = {
    #[allow(unused_extern_crates, clippy::useless_attribute)]
    extern crate serde as _serde;
    #[automatically_derived]
    impl _serde::Serialize for Blockchain {
        fn serialize<__S>(
            &self,
            __serializer: __S,
        ) -> _serde::__private::Result<__S::Ok, __S::Error>
        where
            __S: _serde::Serializer,
        {
            let mut __serde_state = match _serde::Serializer::serialize_struct(
                __serializer,
                "Blockchain",
                false as usize + 1 + 1 + 1 + 1 + 1 + 1 + 1,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "name",
                &self.name,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "displayName",
                &self.displayName,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "chainId",
                &self.chainId,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "defaultDecimals",
                &self.defaultDecimals,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "type_",
                &self.type_,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "logo",
                &self.logo,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "info",
                &self.info,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            _serde::ser::SerializeStruct::end(__serde_state)
        }
    }
};
#[doc(hidden)]
#[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
const _: () = {
    #[allow(unused_extern_crates, clippy::useless_attribute)]
    extern crate serde as _serde;
    #[automatically_derived]

};
struct ChainInfo {
    chainName: String,
    nativeCurrency: Option<ChainNativeCurrency>,
    blockExplorerUrls: Option<Vec<String>>,
    rpcUrls: Option<Vec<String>>,
}
#[doc(hidden)]
#[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
const _: () = {
    #[allow(unused_extern_crates, clippy::useless_attribute)]
    extern crate serde as _serde;
    #[automatically_derived]
    impl _serde::Serialize for ChainInfo {
        fn serialize<__S>(
            &self,
            __serializer: __S,
        ) -> _serde::__private::Result<__S::Ok, __S::Error>
        where
            __S: _serde::Serializer,
        {
            let mut __serde_state = match _serde::Serializer::serialize_struct(
                __serializer,
                "ChainInfo",
                false as usize + 1 + 1 + 1 + 1,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "chainName",
                &self.chainName,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "nativeCurrency",
                &self.nativeCurrency,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "blockExplorerUrls",
                &self.blockExplorerUrls,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "rpcUrls",
                &self.rpcUrls,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            _serde::ser::SerializeStruct::end(__serde_state)
        }
    }
};
#[doc(hidden)]
#[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
const _: () = {
    #[allow(unused_extern_crates, clippy::useless_attribute)]
    extern crate serde as _serde;
    #[automatically_derived]
    impl<'de> _serde::Deserialize<'de> for ChainInfo {
        fn deserialize<__D>(
            __deserializer: __D,
        ) -> _serde::__private::Result<Self, __D::Error>
        where
            __D: _serde::Deserializer<'de>,
        {
            #[allow(non_camel_case_types)]
            enum __Field {
                __field0,
                __field1,
                __field2,
                __field3,
                __ignore,
            }
            struct __FieldVisitor;
            impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                type Value = __Field;
                fn expecting(
                    &self,
                    __formatter: &mut _serde::__private::Formatter,
                ) -> _serde::__private::fmt::Result {
                    _serde::__private::Formatter::write_str(
                        __formatter,
                        "field identifier",
                    )
                }
                fn visit_u64<__E>(
                    self,
                    __value: u64,
                ) -> _serde::__private::Result<Self::Value, __E>
                where
                    __E: _serde::de::Error,
                {
                    match __value {
                        0u64 => _serde::__private::Ok(__Field::__field0),
                        1u64 => _serde::__private::Ok(__Field::__field1),
                        2u64 => _serde::__private::Ok(__Field::__field2),
                        3u64 => _serde::__private::Ok(__Field::__field3),
                        _ => _serde::__private::Ok(__Field::__ignore),
                    }
                }
                fn visit_str<__E>(
                    self,
                    __value: &str,
                ) -> _serde::__private::Result<Self::Value, __E>
                where
                    __E: _serde::de::Error,
                {
                    match __value {
                        "chainName" => _serde::__private::Ok(__Field::__field0),
                        "nativeCurrency" => _serde::__private::Ok(__Field::__field1),
                        "blockExplorerUrls" => _serde::__private::Ok(__Field::__field2),
                        "rpcUrls" => _serde::__private::Ok(__Field::__field3),
                        _ => _serde::__private::Ok(__Field::__ignore),
                    }
                }
                fn visit_bytes<__E>(
                    self,
                    __value: &[u8],
                ) -> _serde::__private::Result<Self::Value, __E>
                where
                    __E: _serde::de::Error,
                {
                    match __value {
                        b"chainName" => _serde::__private::Ok(__Field::__field0),
                        b"nativeCurrency" => _serde::__private::Ok(__Field::__field1),
                        b"blockExplorerUrls" => _serde::__private::Ok(__Field::__field2),
                        b"rpcUrls" => _serde::__private::Ok(__Field::__field3),
                        _ => _serde::__private::Ok(__Field::__ignore),
                    }
                }
            }
            impl<'de> _serde::Deserialize<'de> for __Field {
                #[inline]
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    _serde::Deserializer::deserialize_identifier(
                        __deserializer,
                        __FieldVisitor,
                    )
                }
            }
            struct __Visitor<'de> {
                marker: _serde::__private::PhantomData<ChainInfo>,
                lifetime: _serde::__private::PhantomData<&'de ()>,
            }
            impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                type Value = ChainInfo;
                fn expecting(
                    &self,
                    __formatter: &mut _serde::__private::Formatter,
                ) -> _serde::__private::fmt::Result {
                    _serde::__private::Formatter::write_str(
                        __formatter,
                        "struct ChainInfo",
                    )
                }
                #[inline]
                fn visit_seq<__A>(
                    self,
                    mut __seq: __A,
                ) -> _serde::__private::Result<Self::Value, __A::Error>
                where
                    __A: _serde::de::SeqAccess<'de>,
                {
                    let __field0 = match match _serde::de::SeqAccess::next_element::<
                        String,
                    >(&mut __seq) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    } {
                        _serde::__private::Some(__value) => __value,
                        _serde::__private::None => {
                            return _serde::__private::Err(
                                _serde::de::Error::invalid_length(
                                    0usize,
                                    &"struct ChainInfo with 4 elements",
                                ),
                            );
                        }
                    };
                    let __field1 = match match _serde::de::SeqAccess::next_element::<
                        Option<ChainNativeCurrency>,
                    >(&mut __seq) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    } {
                        _serde::__private::Some(__value) => __value,
                        _serde::__private::None => {
                            return _serde::__private::Err(
                                _serde::de::Error::invalid_length(
                                    1usize,
                                    &"struct ChainInfo with 4 elements",
                                ),
                            );
                        }
                    };
                    let __field2 = match match _serde::de::SeqAccess::next_element::<
                        Option<Vec<String>>,
                    >(&mut __seq) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    } {
                        _serde::__private::Some(__value) => __value,
                        _serde::__private::None => {
                            return _serde::__private::Err(
                                _serde::de::Error::invalid_length(
                                    2usize,
                                    &"struct ChainInfo with 4 elements",
                                ),
                            );
                        }
                    };
                    let __field3 = match match _serde::de::SeqAccess::next_element::<
                        Option<Vec<String>>,
                    >(&mut __seq) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    } {
                        _serde::__private::Some(__value) => __value,
                        _serde::__private::None => {
                            return _serde::__private::Err(
                                _serde::de::Error::invalid_length(
                                    3usize,
                                    &"struct ChainInfo with 4 elements",
                                ),
                            );
                        }
                    };
                    _serde::__private::Ok(ChainInfo {
                        chainName: __field0,
                        nativeCurrency: __field1,
                        blockExplorerUrls: __field2,
                        rpcUrls: __field3,
                    })
                }
                #[inline]
                fn visit_map<__A>(
                    self,
                    mut __map: __A,
                ) -> _serde::__private::Result<Self::Value, __A::Error>
                where
                    __A: _serde::de::MapAccess<'de>,
                {
                    let mut __field0: _serde::__private::Option<String> = _serde::__private::None;
                    let mut __field1: _serde::__private::Option<
                        Option<ChainNativeCurrency>,
                    > = _serde::__private::None;
                    let mut __field2: _serde::__private::Option<Option<Vec<String>>> = _serde::__private::None;
                    let mut __field3: _serde::__private::Option<Option<Vec<String>>> = _serde::__private::None;
                    while let _serde::__private::Some(__key)
                        = match _serde::de::MapAccess::next_key::<__Field>(&mut __map) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        } {
                        match __key {
                            __Field::__field0 => {
                                if _serde::__private::Option::is_some(&__field0) {
                                    return _serde::__private::Err(
                                        <__A::Error as _serde::de::Error>::duplicate_field(
                                            "chainName",
                                        ),
                                    );
                                }
                                __field0 = _serde::__private::Some(
                                    match _serde::de::MapAccess::next_value::<
                                        String,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    },
                                );
                            }
                            __Field::__field1 => {
                                if _serde::__private::Option::is_some(&__field1) {
                                    return _serde::__private::Err(
                                        <__A::Error as _serde::de::Error>::duplicate_field(
                                            "nativeCurrency",
                                        ),
                                    );
                                }
                                __field1 = _serde::__private::Some(
                                    match _serde::de::MapAccess::next_value::<
                                        Option<ChainNativeCurrency>,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    },
                                );
                            }
                            __Field::__field2 => {
                                if _serde::__private::Option::is_some(&__field2) {
                                    return _serde::__private::Err(
                                        <__A::Error as _serde::de::Error>::duplicate_field(
                                            "blockExplorerUrls",
                                        ),
                                    );
                                }
                                __field2 = _serde::__private::Some(
                                    match _serde::de::MapAccess::next_value::<
                                        Option<Vec<String>>,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    },
                                );
                            }
                            __Field::__field3 => {
                                if _serde::__private::Option::is_some(&__field3) {
                                    return _serde::__private::Err(
                                        <__A::Error as _serde::de::Error>::duplicate_field(
                                            "rpcUrls",
                                        ),
                                    );
                                }
                                __field3 = _serde::__private::Some(
                                    match _serde::de::MapAccess::next_value::<
                                        Option<Vec<String>>,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    },
                                );
                            }
                            _ => {
                                let _ = match _serde::de::MapAccess::next_value::<
                                    _serde::de::IgnoredAny,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                };
                            }
                        }
                    }
                    let __field0 = match __field0 {
                        _serde::__private::Some(__field0) => __field0,
                        _serde::__private::None => {
                            match _serde::__private::de::missing_field("chainName") {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            }
                        }
                    };
                    let __field1 = match __field1 {
                        _serde::__private::Some(__field1) => __field1,
                        _serde::__private::None => {
                            match _serde::__private::de::missing_field(
                                "nativeCurrency",
                            ) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            }
                        }
                    };
                    let __field2 = match __field2 {
                        _serde::__private::Some(__field2) => __field2,
                        _serde::__private::None => {
                            match _serde::__private::de::missing_field(
                                "blockExplorerUrls",
                            ) {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            }
                        }
                    };
                    let __field3 = match __field3 {
                        _serde::__private::Some(__field3) => __field3,
                        _serde::__private::None => {
                            match _serde::__private::de::missing_field("rpcUrls") {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            }
                        }
                    };
                    _serde::__private::Ok(ChainInfo {
                        chainName: __field0,
                        nativeCurrency: __field1,
                        blockExplorerUrls: __field2,
                        rpcUrls: __field3,
                    })
                }
            }
            const FIELDS: &'static [&'static str] = &[
                "chainName",
                "nativeCurrency",
                "blockExplorerUrls",
                "rpcUrls",
            ];
            _serde::Deserializer::deserialize_struct(
                __deserializer,
                "ChainInfo",
                FIELDS,
                __Visitor {
                    marker: _serde::__private::PhantomData::<ChainInfo>,
                    lifetime: _serde::__private::PhantomData,
                },
            )
        }
    }
};
struct ChainNativeCurrency {
    name: String,
    symbol: String,
    decimals: u8,
}
#[doc(hidden)]
#[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
const _: () = {
    #[allow(unused_extern_crates, clippy::useless_attribute)]
    extern crate serde as _serde;
    #[automatically_derived]
    impl _serde::Serialize for ChainNativeCurrency {
        fn serialize<__S>(
            &self,
            __serializer: __S,
        ) -> _serde::__private::Result<__S::Ok, __S::Error>
        where
            __S: _serde::Serializer,
        {
            let mut __serde_state = match _serde::Serializer::serialize_struct(
                __serializer,
                "ChainNativeCurrency",
                false as usize + 1 + 1 + 1,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "name",
                &self.name,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "symbol",
                &self.symbol,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            match _serde::ser::SerializeStruct::serialize_field(
                &mut __serde_state,
                "decimals",
                &self.decimals,
            ) {
                _serde::__private::Ok(__val) => __val,
                _serde::__private::Err(__err) => {
                    return _serde::__private::Err(__err);
                }
            };
            _serde::ser::SerializeStruct::end(__serde_state)
        }
    }
};
#[doc(hidden)]
#[allow(non_upper_case_globals, unused_attributes, unused_qualifications)]
const _: () = {
    #[allow(unused_extern_crates, clippy::useless_attribute)]
    extern crate serde as _serde;
    #[automatically_derived]
    impl<'de> _serde::Deserialize<'de> for ChainNativeCurrency {
        fn deserialize<__D>(
            __deserializer: __D,
        ) -> _serde::__private::Result<Self, __D::Error>
        where
            __D: _serde::Deserializer<'de>,
        {
            #[allow(non_camel_case_types)]
            enum __Field {
                __field0,
                __field1,
                __field2,
                __ignore,
            }
            struct __FieldVisitor;
            impl<'de> _serde::de::Visitor<'de> for __FieldVisitor {
                type Value = __Field;
                fn expecting(
                    &self,
                    __formatter: &mut _serde::__private::Formatter,
                ) -> _serde::__private::fmt::Result {
                    _serde::__private::Formatter::write_str(
                        __formatter,
                        "field identifier",
                    )
                }
                fn visit_u64<__E>(
                    self,
                    __value: u64,
                ) -> _serde::__private::Result<Self::Value, __E>
                where
                    __E: _serde::de::Error,
                {
                    match __value {
                        0u64 => _serde::__private::Ok(__Field::__field0),
                        1u64 => _serde::__private::Ok(__Field::__field1),
                        2u64 => _serde::__private::Ok(__Field::__field2),
                        _ => _serde::__private::Ok(__Field::__ignore),
                    }
                }
                fn visit_str<__E>(
                    self,
                    __value: &str,
                ) -> _serde::__private::Result<Self::Value, __E>
                where
                    __E: _serde::de::Error,
                {
                    match __value {
                        "name" => _serde::__private::Ok(__Field::__field0),
                        "symbol" => _serde::__private::Ok(__Field::__field1),
                        "decimals" => _serde::__private::Ok(__Field::__field2),
                        _ => _serde::__private::Ok(__Field::__ignore),
                    }
                }
                fn visit_bytes<__E>(
                    self,
                    __value: &[u8],
                ) -> _serde::__private::Result<Self::Value, __E>
                where
                    __E: _serde::de::Error,
                {
                    match __value {
                        b"name" => _serde::__private::Ok(__Field::__field0),
                        b"symbol" => _serde::__private::Ok(__Field::__field1),
                        b"decimals" => _serde::__private::Ok(__Field::__field2),
                        _ => _serde::__private::Ok(__Field::__ignore),
                    }
                }
            }
            impl<'de> _serde::Deserialize<'de> for __Field {
                #[inline]
                fn deserialize<__D>(
                    __deserializer: __D,
                ) -> _serde::__private::Result<Self, __D::Error>
                where
                    __D: _serde::Deserializer<'de>,
                {
                    _serde::Deserializer::deserialize_identifier(
                        __deserializer,
                        __FieldVisitor,
                    )
                }
            }
            struct __Visitor<'de> {
                marker: _serde::__private::PhantomData<ChainNativeCurrency>,
                lifetime: _serde::__private::PhantomData<&'de ()>,
            }
            impl<'de> _serde::de::Visitor<'de> for __Visitor<'de> {
                type Value = ChainNativeCurrency;
                fn expecting(
                    &self,
                    __formatter: &mut _serde::__private::Formatter,
                ) -> _serde::__private::fmt::Result {
                    _serde::__private::Formatter::write_str(
                        __formatter,
                        "struct ChainNativeCurrency",
                    )
                }
                #[inline]
                fn visit_seq<__A>(
                    self,
                    mut __seq: __A,
                ) -> _serde::__private::Result<Self::Value, __A::Error>
                where
                    __A: _serde::de::SeqAccess<'de>,
                {
                    let __field0 = match match _serde::de::SeqAccess::next_element::<
                        String,
                    >(&mut __seq) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    } {
                        _serde::__private::Some(__value) => __value,
                        _serde::__private::None => {
                            return _serde::__private::Err(
                                _serde::de::Error::invalid_length(
                                    0usize,
                                    &"struct ChainNativeCurrency with 3 elements",
                                ),
                            );
                        }
                    };
                    let __field1 = match match _serde::de::SeqAccess::next_element::<
                        String,
                    >(&mut __seq) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    } {
                        _serde::__private::Some(__value) => __value,
                        _serde::__private::None => {
                            return _serde::__private::Err(
                                _serde::de::Error::invalid_length(
                                    1usize,
                                    &"struct ChainNativeCurrency with 3 elements",
                                ),
                            );
                        }
                    };
                    let __field2 = match match _serde::de::SeqAccess::next_element::<
                        u8,
                    >(&mut __seq) {
                        _serde::__private::Ok(__val) => __val,
                        _serde::__private::Err(__err) => {
                            return _serde::__private::Err(__err);
                        }
                    } {
                        _serde::__private::Some(__value) => __value,
                        _serde::__private::None => {
                            return _serde::__private::Err(
                                _serde::de::Error::invalid_length(
                                    2usize,
                                    &"struct ChainNativeCurrency with 3 elements",
                                ),
                            );
                        }
                    };
                    _serde::__private::Ok(ChainNativeCurrency {
                        name: __field0,
                        symbol: __field1,
                        decimals: __field2,
                    })
                }
                #[inline]
                fn visit_map<__A>(
                    self,
                    mut __map: __A,
                ) -> _serde::__private::Result<Self::Value, __A::Error>
                where
                    __A: _serde::de::MapAccess<'de>,
                {
                    let mut __field0: _serde::__private::Option<String> = _serde::__private::None;
                    let mut __field1: _serde::__private::Option<String> = _serde::__private::None;
                    let mut __field2: _serde::__private::Option<u8> = _serde::__private::None;
                    while let _serde::__private::Some(__key)
                        = match _serde::de::MapAccess::next_key::<__Field>(&mut __map) {
                            _serde::__private::Ok(__val) => __val,
                            _serde::__private::Err(__err) => {
                                return _serde::__private::Err(__err);
                            }
                        } {
                        match __key {
                            __Field::__field0 => {
                                if _serde::__private::Option::is_some(&__field0) {
                                    return _serde::__private::Err(
                                        <__A::Error as _serde::de::Error>::duplicate_field("name"),
                                    );
                                }
                                __field0 = _serde::__private::Some(
                                    match _serde::de::MapAccess::next_value::<
                                        String,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    },
                                );
                            }
                            __Field::__field1 => {
                                if _serde::__private::Option::is_some(&__field1) {
                                    return _serde::__private::Err(
                                        <__A::Error as _serde::de::Error>::duplicate_field("symbol"),
                                    );
                                }
                                __field1 = _serde::__private::Some(
                                    match _serde::de::MapAccess::next_value::<
                                        String,
                                    >(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    },
                                );
                            }
                            __Field::__field2 => {
                                if _serde::__private::Option::is_some(&__field2) {
                                    return _serde::__private::Err(
                                        <__A::Error as _serde::de::Error>::duplicate_field(
                                            "decimals",
                                        ),
                                    );
                                }
                                __field2 = _serde::__private::Some(
                                    match _serde::de::MapAccess::next_value::<u8>(&mut __map) {
                                        _serde::__private::Ok(__val) => __val,
                                        _serde::__private::Err(__err) => {
                                            return _serde::__private::Err(__err);
                                        }
                                    },
                                );
                            }
                            _ => {
                                let _ = match _serde::de::MapAccess::next_value::<
                                    _serde::de::IgnoredAny,
                                >(&mut __map) {
                                    _serde::__private::Ok(__val) => __val,
                                    _serde::__private::Err(__err) => {
                                        return _serde::__private::Err(__err);
                                    }
                                };
                            }
                        }
                    }
                    let __field0 = match __field0 {
                        _serde::__private::Some(__field0) => __field0,
                        _serde::__private::None => {
                            match _serde::__private::de::missing_field("name") {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            }
                        }
                    };
                    let __field1 = match __field1 {
                        _serde::__private::Some(__field1) => __field1,
                        _serde::__private::None => {
                            match _serde::__private::de::missing_field("symbol") {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            }
                        }
                    };
                    let __field2 = match __field2 {
                        _serde::__private::Some(__field2) => __field2,
                        _serde::__private::None => {
                            match _serde::__private::de::missing_field("decimals") {
                                _serde::__private::Ok(__val) => __val,
                                _serde::__private::Err(__err) => {
                                    return _serde::__private::Err(__err);
                                }
                            }
                        }
                    };
                    _serde::__private::Ok(ChainNativeCurrency {
                        name: __field0,
                        symbol: __field1,
                        decimals: __field2,
                    })
                }
            }
            const FIELDS: &'static [&'static str] = &["name", "symbol", "decimals"];
            _serde::Deserializer::deserialize_struct(
                __deserializer,
                "ChainNativeCurrency",
                FIELDS,
                __Visitor {
                    marker: _serde::__private::PhantomData::<ChainNativeCurrency>,
                    lifetime: _serde::__private::PhantomData,
                },
            )
        }
    }
};
pub fn get_metadata(args: ArgsGetMetadata) -> Metadata {
    let http_response = HttpModule::get(
            &http_module::ArgsGet {
                url: "https://api.rango.exchange/basic/meta?apiKey=7b3d45e1-fdc1-4642-be95-3b8a8c6aebcf"
                    .to_string(),
                request: None,
            },
        )
        .expect("Received an error as HTTP Response")
        .expect("Received an empty HTTP Response");
    let response_body = http_response
        .body
        .expect("Received an empty body as HTTP Response");
    let content = JSON::from_str::<MetadataResponse>(&response_body).unwrap();
    return Metadata {
        result: content.blockchains.get(0).unwrap().name.to_string(),
    };
}
pub fn quote(args: ArgsQuote) -> QuoteResponse {
    ::core::panicking::panic_fmt(::core::fmt::Arguments::new_v1(&["lala"], &[]))
}

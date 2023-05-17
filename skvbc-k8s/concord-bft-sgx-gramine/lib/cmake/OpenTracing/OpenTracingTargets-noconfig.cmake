#----------------------------------------------------------------
# Generated CMake target import file.
#----------------------------------------------------------------

# Commands may need to know the format version.
set(CMAKE_IMPORT_FILE_VERSION 1)

# Import target "OpenTracing::opentracing" for configuration ""
set_property(TARGET OpenTracing::opentracing APPEND PROPERTY IMPORTED_CONFIGURATIONS NOCONFIG)
set_target_properties(OpenTracing::opentracing PROPERTIES
  IMPORTED_LOCATION_NOCONFIG "${_IMPORT_PREFIX}/lib/libopentracing.so.1.6.0"
  IMPORTED_SONAME_NOCONFIG "libopentracing.so.1"
  )

list(APPEND _cmake_import_check_targets OpenTracing::opentracing )
list(APPEND _cmake_import_check_files_for_OpenTracing::opentracing "${_IMPORT_PREFIX}/lib/libopentracing.so.1.6.0" )

# Import target "OpenTracing::opentracing-static" for configuration ""
set_property(TARGET OpenTracing::opentracing-static APPEND PROPERTY IMPORTED_CONFIGURATIONS NOCONFIG)
set_target_properties(OpenTracing::opentracing-static PROPERTIES
  IMPORTED_LINK_INTERFACE_LANGUAGES_NOCONFIG "CXX"
  IMPORTED_LOCATION_NOCONFIG "${_IMPORT_PREFIX}/lib/libopentracing.a"
  )

list(APPEND _cmake_import_check_targets OpenTracing::opentracing-static )
list(APPEND _cmake_import_check_files_for_OpenTracing::opentracing-static "${_IMPORT_PREFIX}/lib/libopentracing.a" )

# Import target "OpenTracing::opentracing_mocktracer" for configuration ""
set_property(TARGET OpenTracing::opentracing_mocktracer APPEND PROPERTY IMPORTED_CONFIGURATIONS NOCONFIG)
set_target_properties(OpenTracing::opentracing_mocktracer PROPERTIES
  IMPORTED_LOCATION_NOCONFIG "${_IMPORT_PREFIX}/lib/libopentracing_mocktracer.so.1.6.0"
  IMPORTED_SONAME_NOCONFIG "libopentracing_mocktracer.so.1"
  )

list(APPEND _cmake_import_check_targets OpenTracing::opentracing_mocktracer )
list(APPEND _cmake_import_check_files_for_OpenTracing::opentracing_mocktracer "${_IMPORT_PREFIX}/lib/libopentracing_mocktracer.so.1.6.0" )

# Import target "OpenTracing::opentracing_mocktracer-static" for configuration ""
set_property(TARGET OpenTracing::opentracing_mocktracer-static APPEND PROPERTY IMPORTED_CONFIGURATIONS NOCONFIG)
set_target_properties(OpenTracing::opentracing_mocktracer-static PROPERTIES
  IMPORTED_LINK_INTERFACE_LANGUAGES_NOCONFIG "CXX"
  IMPORTED_LOCATION_NOCONFIG "${_IMPORT_PREFIX}/lib/libopentracing_mocktracer.a"
  )

list(APPEND _cmake_import_check_targets OpenTracing::opentracing_mocktracer-static )
list(APPEND _cmake_import_check_files_for_OpenTracing::opentracing_mocktracer-static "${_IMPORT_PREFIX}/lib/libopentracing_mocktracer.a" )

# Commands beyond this point should not need to know the version.
set(CMAKE_IMPORT_FILE_VERSION)

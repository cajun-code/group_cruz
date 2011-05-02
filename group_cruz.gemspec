# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "group_cruz/version"

Gem::Specification.new do |s|
  s.name        = "group_cruz"
  s.version     = GroupCruz::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Allan Davis"]
  s.email       = ["cajun.code@gmail.com"]
  s.homepage    = "http://rubygems.org/gems/group_cruz"
  s.summary     = %q{TODO: Write a gem summary}
  s.description = %q{TODO: Write a gem description}

  s.rubyforge_project = "group_cruz"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
  s.add_dependency "builder"
  s.add_dependency "spreadsheet"
  s.add_dependency "data_mapper"
  s.add_dependency "dm-sqlite-adapter"
end

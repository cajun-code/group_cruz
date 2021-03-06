require 'data_mapper'
require 'optparse'
require "group_cruz/models"
require "builder"
require 'spreadsheet'

module GroupCruz
  class CruzManager
    # DataMapper.setup(:default, 'sqlite:///path/to/project.db')

    # create cruz database if it does not exist
    def initialize
      dir = File.join Dir.home, "cruz"
      Dir.mkdir( dir) unless Dir.exist? dir
      url = "sqlite://#{dir}/cruise.db"

      DataMapper.setup(:default, url)
      DataMapper.auto_upgrade!
    end
    # process spreadsheet into cruz database
    def import_sheet(filename)
      puts "Importing #{filename}"
      Spreadsheet.open(filename).worksheets.each do |sheet|
        puts "Processing #{sheet.name}"
        sheet.each do |row|
          unless (row[0] == "Destination" or row[0].nil? or row[0]== "") and(
              row[2] == "Vendor" or row[2].nil? or row[2]== "" )
            cruise = GroupCruz::Cruise.new
            cruise.destination = row[0]
            puts "Cruise Destination #{cruise.destination}"
            cruise.date = row[1]
            cruise.vendor = row[2]
            cruise.ship = row[3]
            cruise.group_num = row[4]
            cruise.product = row[5]
            cruise.category_fares = row[6]
            cruise.amenities = row[7]
            cruise.availability = row[8]
            cruise.save
          end
        end
      end
      puts "Import Complete"
    end
    # generate xml from database
    def export_xml(output_filename)
      puts "Generating XML: #{output_filename}"
      target = open output_filename, "w"
      xml = Builder::XmlMarkup.new(:target=> target , :indent => 2)
      xml.instruct!
      xml.groupcruises do
        GroupCruz::Cruise.all.each do |cruise|
          xml.groupcruise do
            cruise.attributes.each do |key, value|
              xml.method_missing(key.to_sym, value) unless key == :id or value.nil?
            end
          end
        end
      end
    end
    # console processor
    def process_args(args)
      opts = OptionParser.new
      opts.on("-i", "--import FILENAME", "Import excel spreadsheets"){|val| import_sheet File.absolute_path val}
      opts.on("-e", "--export FILENAME", "Export XML file"){|val| export_xml File.absolute_path val}
      opts.on("-h", "--help", "Generates this help message") {puts opts}
      opts.parse args
      puts opts if args.empty?

    end
  end
end
